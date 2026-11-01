"""
TrendTide REST API Server
Twitter/X-Style Multi-Domain Live Trends Discovery & AI Forecasting Platform
"""
import sys
import os
import uuid
import time
import re
import json
import hashlib
import secrets
import subprocess
from datetime import datetime, timedelta
from urllib.parse import urlencode, urlparse
import jwt

TRENDTIDE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if TRENDTIDE_DIR not in sys.path:
    sys.path.insert(0, TRENDTIDE_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(TRENDTIDE_DIR, ".env"))

from flask import Flask, current_app, jsonify, request, send_from_directory
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from database.models import (
    init_db, SessionLocal, UserModel, DomainModel,
    TrendItemModel, TrendArticleModel, TrendHistoryModel, WatchlistModel
)
from trend_engine.ingestion import (
    run_full_ingestion, get_source_connection_statuses, DOMAIN_CONFIGS
)
from trend_engine.forecaster import forecast_trend

CLIENT_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'client', 'dist'))
JWT_SECRET = os.getenv("JWT_SECRET")
APP_ENV = os.getenv("APP_ENV", "development").lower()
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET must be configured. Copy .env.example to .env and generate a random secret.")
if len(JWT_SECRET.encode("utf-8")) < 32:
    raise RuntimeError("JWT_SECRET must contain at least 32 bytes.")
RATE_LIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI") or "memory://"
if APP_ENV == "production" and RATE_LIMIT_STORAGE_URI == "memory://":
    raise RuntimeError("Configure a shared RATELIMIT_STORAGE_URI such as Redis in production.")
JWT_ALGORITHM = "HS256"
SESSION_COOKIE = "trendtide_session"
SESSION_TTL = timedelta(minutes=15)
APP_BASE_URL = os.getenv("APP_BASE_URL", "http://localhost:3001").rstrip("/")
if APP_ENV == "production" and urlparse(APP_BASE_URL).scheme != "https":
    raise RuntimeError("APP_BASE_URL must use HTTPS in production.")
SMTP_SCRIPT = os.path.join(TRENDTIDE_DIR, "client", "send-email.mjs")

def create_user_token(user: UserModel) -> str:
    payload = {
        "user_id": user.id,
        "exp": datetime.utcnow() + SESSION_TTL
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_user_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None

def get_current_user(req):
    token = req.cookies.get(SESSION_COOKIE)
    if not token:
        return None
    payload = decode_user_token(token)
    if not payload or 'user_id' not in payload:
        return None
    session = SessionLocal()
    try:
        user = session.query(UserModel).filter_by(id=payload["user_id"]).first()
        return user.id if user and user.is_verified else None
    finally:
        session.close()

class EmailDeliveryError(Exception):
    pass

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def generate_verification_code() -> str:
    return f"{secrets.randbelow(1000000):06d}"

def send_email(email_type: str, email: str, name: str, token: str, code: str | None = None) -> None:
    """Deliver email using the project's Nodemailer SMTP adapter."""
    payload = {
        "type": email_type,
        "email": email,
        "name": name,
        "url": f"{APP_BASE_URL}/verify-email?{urlencode({'token': token, 'email': email})}"
        if email_type == "verification"
        else f"{APP_BASE_URL}/reset-password?{urlencode({'token': token})}",
        "code": code,
    }
    try:
        result = subprocess.run(
            ["node", SMTP_SCRIPT],
            input=json.dumps(payload),
            text=True,
            capture_output=True,
            timeout=30,
            check=False,
            cwd=TRENDTIDE_DIR,
        )
    except (OSError, subprocess.TimeoutExpired) as error:
        current_app.logger.error("Could not start Nodemailer SMTP delivery: %s", error)
        raise EmailDeliveryError("Email delivery is temporarily unavailable.") from error

    if result.returncode != 0:
        current_app.logger.error("Nodemailer SMTP delivery failed: %s", result.stderr.strip())
        raise EmailDeliveryError("Email delivery is temporarily unavailable.")

    try:
        delivery_result = json.loads(result.stdout)
    except json.JSONDecodeError as error:
        current_app.logger.error("Nodemailer returned an invalid delivery response.")
        raise EmailDeliveryError("Email delivery is temporarily unavailable.") from error
    if not delivery_result.get("sent"):
        raise EmailDeliveryError("Email delivery is temporarily unavailable.")

app = Flask(__name__)
limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri=RATE_LIMIT_STORAGE_URI,
    default_limits=[],
)

@app.errorhandler(429)
def handle_rate_limit(error):
    return jsonify({"success": False, "error": "Too many attempts. Please wait before trying again."}), 429

@app.after_request
def add_cors_headers(response):
    allowed_origins = {APP_BASE_URL}
    request_origin = request.headers.get("Origin")
    if request_origin and request_origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = request_origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Vary"] = "Origin"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,PUT,POST,DELETE,OPTIONS"
    if request.path.startswith("/api/auth/"):
        response.headers["Cache-Control"] = "no-store"
        response.headers["Pragma"] = "no-cache"
    return response

# Initialize DB on launch
init_db()

# Check if domains and trends are populated; if not, trigger initial ingestion
def ensure_initial_trends():
    session = SessionLocal()
    try:
        count = session.query(TrendItemModel).count()
        if count == 0:
            print("[Startup] Initializing TrendTide multi-domain live trends...")
            run_full_ingestion()
    except Exception as e:
        print(f"[Startup Warning] Could not verify initial trends: {e}")
    finally:
        session.close()

ensure_initial_trends()

# ----------------- AUTHENTICATION ROUTES ----------------- #

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def valid_email(value) -> bool:
    return isinstance(value, str) and len(value) <= 254 and EMAIL_PATTERN.fullmatch(value) is not None

def valid_password(value) -> bool:
    if not isinstance(value, str) or len(value) < 8:
        return False
    try:
        return len(value.encode("utf-8")) <= 72
    except UnicodeEncodeError:
        return False

def session_cookie_secure() -> bool:
    if APP_ENV == "production":
        return True
    configured = os.getenv("SESSION_COOKIE_SECURE")
    return configured.lower() == "true" if configured is not None else False

def set_session_cookie(response, token: str) -> None:
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=int(SESSION_TTL.total_seconds()),
        httponly=True,
        secure=session_cookie_secure(),
        samesite="Lax",
        path="/",
    )

@app.before_request
def enforce_auth_origin():
    if request.path.startswith("/api/auth/") and request.method in {"POST", "PUT", "DELETE"}:
        origin = request.headers.get("Origin")
        if origin and origin not in {APP_BASE_URL, request.host_url.rstrip("/")}:
            return jsonify({"success": False, "error": "Request origin is not allowed."}), 403
    return None

@app.route('/api/auth/register', methods=['POST'])
@limiter.limit("3 per hour")
def auth_register():
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"success": False, "error": "Invalid registration details."}), 400
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")

    if not isinstance(name, str) or not name.strip() or len(name.strip()) > 120:
        return jsonify({"success": False, "error": "Enter your full name (up to 120 characters)."}), 400
    name = name.strip()
    email = email.strip() if isinstance(email, str) else email
    if not valid_email(email):
        return jsonify({"success": False, "error": "Enter a valid email address."}), 400
    email = email.lower()
    if not valid_password(password):
        return jsonify({"success": False, "error": "Password must be at least 8 characters and no more than 72 UTF-8 bytes."}), 400
    if password != confirm_password:
        return jsonify({"success": False, "error": "Passwords do not match."}), 400

    session = SessionLocal()
    try:
        existing = session.query(UserModel).filter_by(email=email).first()
        if existing:
            return jsonify({"success": False, "error": "An account with this email address already exists."}), 409

        token = secrets.token_urlsafe(32)
        verification_code = generate_verification_code()
        now = datetime.utcnow()
        user = UserModel(
            id=f"usr_{uuid.uuid4().hex}",
            email=email,
            full_name=name,
            role="Lead Trend Strategist",
            is_verified=False,
            verification_code=verification_code,
            verification_expires_at=now + timedelta(minutes=15),
            email_verification_token_hash=hash_token(token),
            email_verification_expires_at=now + timedelta(minutes=15),
            created_at=now,
            updated_at=now,
        )
        user.set_password(password)
        session.add(user)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            return jsonify({"success": False, "error": "An account with this email address already exists."}), 409

        try:
            send_email("verification", email, name, token, verification_code)
        except EmailDeliveryError:
            return jsonify({
                "success": False,
                "email": email,
                "error": "Your account was created, but the verification email could not be delivered. Please try resending it shortly.",
            }), 503

        return jsonify({
            "success": True,
            "requiresVerification": True,
            "email": email,
            "message": "Account created. Check your email for a verification link, valid for 15 minutes."
        }), 201
    finally:
        session.close()

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def auth_login():
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"success": False, "error": "Invalid login details."}), 400
    email = data.get("email")
    password = data.get("password")

    email = email.strip() if isinstance(email, str) else email
    if not valid_email(email) or not isinstance(password, str) or not password:
        return jsonify({"success": False, "error": "Please enter both email and password."}), 400
    email = email.lower()

    session = SessionLocal()
    try:
        user = session.query(UserModel).filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({"success": False, "error": "Invalid email address or password."}), 401

        if not user.password_hash.startswith(("$2a$", "$2b$", "$2y$")):
            user.set_password(password)
        user.last_login = datetime.utcnow()
        user.updated_at = datetime.utcnow()
        session.commit()

        token = create_user_token(user)
        response = jsonify({
            "success": True,
            "message": "Authentication successful.",
            "user": user.to_dict()
        })
        set_session_cookie(response, token)
        return response
    finally:
        session.close()

@app.route('/api/auth/resend-verification', methods=['POST'])
@limiter.limit("3 per hour")
def auth_resend_verification():
    data = request.get_json(silent=True) or {}
    email = data.get("email") if isinstance(data, dict) else None
    email = email.strip() if isinstance(email, str) else email
    if not valid_email(email):
        return jsonify({"success": False, "error": "Enter a valid email address."}), 400
    email = email.lower()

    session = SessionLocal()
    try:
        user = session.query(UserModel).filter_by(email=email).first()
        if user and not user.is_verified:
            token = secrets.token_urlsafe(32)
            verification_code = generate_verification_code()
            user.email_verification_token_hash = hash_token(token)
            user.email_verification_expires_at = datetime.utcnow() + timedelta(minutes=15)
            user.verification_code = verification_code
            user.verification_expires_at = datetime.utcnow() + timedelta(minutes=15)
            user.updated_at = datetime.utcnow()
            session.commit()
            try:
                send_email("verification", user.email, user.full_name, token, verification_code)
            except EmailDeliveryError as error:
                current_app.logger.warning("Verification email delivery did not complete: %s", error)
                return jsonify({
                    "success": False,
                    "error": "We could not send the verification code. Please check the email service configuration and try again.",
                }), 503

        return jsonify({
            "success": True,
            "message": "If an unverified account exists for that address, a verification code will be delivered if email service is available."
        })
    finally:
        session.close()

@app.route('/api/auth/verify-email', methods=['POST'])
@limiter.limit("10 per minute")
def auth_verify_email():
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"success": False, "error": "Verification details are invalid."}), 400

    token = data.get("token")
    code = data.get("code")
    email = data.get("email")
    if isinstance(email, str):
        email = email.strip().lower()

    session = SessionLocal()
    try:
        now = datetime.utcnow()
        result = None

        if isinstance(token, str) and 32 <= len(token) <= 128:
            result = session.execute(
                update(UserModel)
                .where(
                    UserModel.email_verification_token_hash == hash_token(token),
                    UserModel.email_verification_expires_at > now,
                    UserModel.is_verified.is_(False),
                )
                .values(
                    is_verified=True,
                    email_verification_token_hash=None,
                    email_verification_expires_at=None,
                    verification_code=None,
                    verification_expires_at=None,
                    updated_at=now,
                )
            )
            session.commit()
            if result.rowcount == 1:
                return jsonify({"success": True, "message": "Email verified successfully."})
            return jsonify({"success": False, "error": "Verification link is invalid, expired, or already used."}), 400

        if isinstance(code, str) and isinstance(email, str) and valid_email(email):
            normalized_code = code.strip()
            if len(normalized_code) != 6 or not normalized_code.isdigit():
                return jsonify({"success": False, "error": "Enter the 6-digit verification code from your email."}), 400

            result = session.execute(
                update(UserModel)
                .where(
                    UserModel.email == email,
                    UserModel.verification_code == normalized_code,
                    UserModel.verification_expires_at > now,
                    UserModel.is_verified.is_(False),
                )
                .values(
                    is_verified=True,
                    verification_code=None,
                    verification_expires_at=None,
                    email_verification_token_hash=None,
                    email_verification_expires_at=None,
                    updated_at=now,
                )
            )
            session.commit()
            if result.rowcount == 1:
                return jsonify({"success": True, "message": "Email verified successfully."})
            return jsonify({"success": False, "error": "Verification code is invalid, expired, or already used."}), 400

        return jsonify({"success": False, "error": "Verification details are invalid or expired."}), 400
    finally:
        session.close()

@app.route('/api/auth/forgot-password', methods=['POST'])
@limiter.limit("3 per hour")
def auth_forgot_password():
    data = request.get_json(silent=True) or {}
    email = data.get("email") if isinstance(data, dict) else None
    email = email.strip() if isinstance(email, str) else email
    if not valid_email(email):
        return jsonify({"success": False, "error": "Enter a valid email address."}), 400
    email = email.lower()

    session = SessionLocal()
    try:
        user = session.query(UserModel).filter_by(email=email).first()
        if user and user.is_verified:
            token = secrets.token_urlsafe(32)
            user.password_reset_token_hash = hash_token(token)
            user.password_reset_expires_at = datetime.utcnow() + timedelta(minutes=15)
            user.updated_at = datetime.utcnow()
            session.commit()
            try:
                send_email("password_reset", user.email, user.full_name, token)
            except EmailDeliveryError as error:
                current_app.logger.warning("Password reset email delivery did not complete: %s", error)

        return jsonify({
            "success": True,
            "message": "If an account exists for that address, reset instructions will be delivered if email service is available."
        })
    finally:
        session.close()

@app.route('/api/auth/reset-password', methods=['POST'])
@limiter.limit("5 per hour")
def auth_reset_password():
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"success": False, "error": "Invalid password reset details."}), 400
    token = data.get("token")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")
    if not isinstance(token, str) or not 32 <= len(token) <= 128:
        return jsonify({"success": False, "error": "Password reset link is invalid or expired."}), 400
    if not valid_password(password):
        return jsonify({"success": False, "error": "Password must be at least 8 characters and no more than 72 UTF-8 bytes."}), 400
    if password != confirm_password:
        return jsonify({"success": False, "error": "Passwords do not match."}), 400

    session = SessionLocal()
    try:
        token_hash = hash_token(token)
        now = datetime.utcnow()
        candidate = UserModel()
        candidate.set_password(password)
        result = session.execute(
            update(UserModel)
            .where(
                UserModel.password_reset_token_hash == token_hash,
                UserModel.password_reset_expires_at > now,
                UserModel.is_verified.is_(True),
            )
            .values(
                password_hash=candidate.password_hash,
                password_reset_token_hash=None,
                password_reset_expires_at=None,
                updated_at=now,
            )
        )
        session.commit()
        if result.rowcount != 1:
            return jsonify({"success": False, "error": "Password reset link is invalid, expired, or already used."}), 400
        return jsonify({"success": True, "message": "Password updated. You can now sign in."})
    finally:
        session.close()

@app.route('/api/auth/me', methods=['GET'])
def auth_me():
    user_id = get_current_user(request)
    if not user_id:
        return jsonify({"success": False, "error": "Unauthorized or session expired."}), 401

    session = SessionLocal()
    try:
        user = session.query(UserModel).filter_by(id=user_id).first()
        if not user or not user.is_verified:
            response = jsonify({"success": False, "error": "Unauthorized or session expired."})
            response.status_code = 401
            response.delete_cookie(SESSION_COOKIE, path="/", httponly=True, secure=session_cookie_secure(), samesite="Lax")
            return response
        return jsonify({
            "success": True,
            "user": user.to_dict()
        })
    finally:
        session.close()

@app.route('/api/auth/logout', methods=['POST'])
def auth_logout():
    response = jsonify({"success": True, "message": "Successfully signed out."})
    response.delete_cookie(SESSION_COOKIE, path="/", httponly=True, secure=session_cookie_secure(), samesite="Lax")
    return response

# ----------------- DOMAIN & TREND ROUTES ----------------- #

@app.route('/api/domains', methods=['GET'])
def get_domains():
    """Returns the 10 domains with metadata and trend counts."""
    session = SessionLocal()
    try:
        domains = session.query(DomainModel).order_by(DomainModel.order_index).all()
        # If DB domains not populated, return config
        if not domains:
            return jsonify({
                "success": True,
                "domains": [
                    {
                        "id": d["id"],
                        "name": d["name"],
                        "slug": d["slug"],
                        "icon": d["icon"],
                        "description": d["description"],
                        "orderIndex": d["order_index"],
                        "trendCount": 8
                    } for d in DOMAIN_CONFIGS
                ]
            })
        return jsonify({
            "success": True,
            "domains": [d.to_dict() for d in domains]
        })
    finally:
        session.close()

@app.route('/api/regions', methods=['GET'])
def get_regions():
    """Returns supported geographic regions with metadata."""
    return jsonify({
        "success": True,
        "regions": [
            {"id": "worldwide", "name": "Worldwide", "flag": "🌐", "description": "Global Telemetry Aggregate"},
            {"id": "us", "name": "United States", "flag": "🇺🇸", "description": "North America & Silicon Valley"},
            {"id": "eu", "name": "Europe", "flag": "🇪🇺", "description": "European Union & Tech Hubs"},
            {"id": "in", "name": "India", "flag": "🇮🇳", "description": "South Asia & Tech Ecosystem"},
            {"id": "uk", "name": "United Kingdom", "flag": "🇬🇧", "description": "London & British Innovation"},
            {"id": "apac", "name": "Asia-Pacific", "flag": "🌏", "description": "East Asia, Japan & Oceania"},
            {"id": "latam", "name": "Latin America", "flag": "🌎", "description": "Brazil, Mexico & LatAm Tech"}
        ]
    })

@app.route('/api/trends/live', methods=['GET'])
def get_live_trends():
    """
    Twitter/X-style Live Trending Feed.
    Returns trending items across all domains ranked by popularity & growth velocity.
    Supports query parameters: sort (ranked | velocity | breaking | volume), domain (slug), platform (x | news | hackernews), region (worldwide | us | in | uk | eu | apac), limit.
    """
    sort = request.args.get('sort', 'ranked')
    domain_filter = request.args.get('domain', None)
    platform_filter = request.args.get('platform', None)
    region_filter = request.args.get('region', 'worldwide')
    limit = int(request.args.get('limit', 60))
    
    session = SessionLocal()
    try:
        query = session.query(TrendItemModel)
        
        if domain_filter and domain_filter != 'all':
            query = query.filter_by(domain_id=domain_filter)

        if platform_filter and platform_filter != 'all':
            query = query.filter_by(source_platform=platform_filter)

        if region_filter and region_filter not in ('worldwide', 'all'):
            # Filter specifically by selected region
            query = query.filter(TrendItemModel.region == region_filter)
            
        if sort == 'velocity':
            query = query.order_by(TrendItemModel.velocity.desc())
        elif sort == 'volume':
            query = query.order_by(TrendItemModel.volume_count.desc())
        elif sort == 'breaking':
            query = query.filter_by(is_breaking=True).order_by(TrendItemModel.velocity.desc())
        else: # ranked default
            query = query.order_by(TrendItemModel.global_rank.asc())
            
        trends = query.limit(limit).all()

        # If strict regional filter returned fewer than 3 items, fallback to regional + worldwide
        if region_filter and region_filter not in ('worldwide', 'all') and len(trends) < 3:
            fallback_query = session.query(TrendItemModel).filter(
                (TrendItemModel.region == region_filter) | (TrendItemModel.region == 'worldwide')
            )
            if domain_filter and domain_filter != 'all':
                fallback_query = fallback_query.filter_by(domain_id=domain_filter)
            if platform_filter and platform_filter != 'all':
                fallback_query = fallback_query.filter_by(source_platform=platform_filter)
            trends = fallback_query.order_by(TrendItemModel.global_rank.asc()).limit(limit).all()
        
        # Get top breaking news spotlight
        breaking_spotlight = session.query(TrendItemModel).filter_by(is_breaking=True).order_by(TrendItemModel.velocity.desc()).first()
        
        return jsonify({
            "success": True,
            "total": len(trends),
            "region": region_filter,
            "spotlight": breaking_spotlight.to_dict() if breaking_spotlight else None,
            "trends": [t.to_dict(include_articles=True, include_history=False) for t in trends],
            "lastUpdated": datetime.utcnow().isoformat()
        })
    finally:
        session.close()

@app.route('/api/trends/x', methods=['GET'])
def get_twitter_trends_endpoint():
    """Returns trending topics exclusively sourced from Twitter/X."""
    limit = int(request.args.get('limit', 50))
    session = SessionLocal()
    try:
        trends = session.query(TrendItemModel).filter_by(source_platform='x').order_by(TrendItemModel.rank.asc()).limit(limit).all()
        return jsonify({
            "success": True,
            "platform": "X (Twitter)",
            "count": len(trends),
            "trends": [t.to_dict(include_articles=True, include_history=False) for t in trends],
            "lastUpdated": datetime.utcnow().isoformat()
        })
    finally:
        session.close()

@app.route('/api/trends/domain/<domain_id>', methods=['GET'])
def get_domain_trends(domain_id: str):
    """
    Domain-wise Twitter/X-style trending page.
    Returns ranked trending topics and discussions exclusively for the requested domain.
    """
    session = SessionLocal()
    try:
        domain = session.query(DomainModel).filter_by(id=domain_id).first()
        if not domain:
            return jsonify({"success": False, "error": f"Domain '{domain_id}' not found."}), 404
            
        trends = session.query(TrendItemModel).filter_by(domain_id=domain_id).order_by(TrendItemModel.rank.asc()).all()
        
        return jsonify({
            "success": True,
            "domain": domain.to_dict(),
            "trends": [t.to_dict(include_articles=True, include_history=False) for t in trends],
            "lastUpdated": datetime.utcnow().isoformat()
        })
    finally:
        session.close()

@app.route('/api/trends/<trend_id>', methods=['GET'])
def get_trend_detail(trend_id: str):
    """
    Detailed Trend Intelligence View.
    Returns trend metadata, historical observations, breaking news articles, and primary source links.
    """
    session = SessionLocal()
    try:
        trend = session.query(TrendItemModel).filter_by(id=trend_id).first()
        if not trend:
            return jsonify({"success": False, "error": f"Trend '{trend_id}' not found."}), 404
            
        return jsonify({
            "success": True,
            "trend": trend.to_dict(include_articles=True, include_history=True)
        })
    finally:
        session.close()

@app.route('/api/trends/<trend_id>/forecast', methods=['GET'])
def get_trend_forecast(trend_id: str):
    """
    AI Trend Forecasting Endpoint.
    Projects 24-hour, 3-day, and 7-day trajectories with 95% confidence intervals using Holt-Winters smoothing.
    Strictly gates on empirical historical depth.
    """
    session = SessionLocal()
    try:
        trend = session.query(TrendItemModel).filter_by(id=trend_id).first()
        if not trend:
            return jsonify({"success": False, "error": f"Trend '{trend_id}' not found."}), 404
            
        history_points = [p.to_dict() for p in trend.history_points]
        
        forecast_result = forecast_trend(
            trend_title=trend.title,
            hashtag=trend.hashtag,
            domain_name=trend.domain.name if trend.domain else trend.domain_id,
            history_points=history_points,
            current_velocity=trend.velocity,
            current_volume=trend.volume_count
        )
        
        return jsonify({
            "success": True,
            "trendId": trend.id,
            "forecast": forecast_result
        })
    finally:
        session.close()

@app.route('/api/search', methods=['GET'])
def search_trends():
    """
    Search & Explore endpoint.
    Searches keywords, topics, hashtags, or domains to discover real-time trend status.
    """
    q = request.args.get('q', '').strip()
    domain_id = request.args.get('domain', None)
    
    if not q:
        return jsonify({"success": True, "results": [], "query": ""})
        
    session = SessionLocal()
    try:
        like_query = f"%{q}%"
        query = session.query(TrendItemModel).filter(
            (TrendItemModel.hashtag.ilike(like_query)) |
            (TrendItemModel.title.ilike(like_query)) |
            (TrendItemModel.summary.ilike(like_query))
        )
        
        if domain_id and domain_id != 'all':
            query = query.filter_by(domain_id=domain_id)
            
        results = query.order_by(TrendItemModel.velocity.desc()).limit(25).all()
        
        return jsonify({
            "success": True,
            "query": q,
            "count": len(results),
            "results": [r.to_dict(include_articles=True, include_history=False) for r in results]
        })
    finally:
        session.close()

# ----------------- WATCHLIST & ALERTS ROUTES ----------------- #

@app.route('/api/watchlist', methods=['GET'])
def get_user_watchlist():
    """Returns followed trends and alerts for the authenticated user."""
    user_id = get_current_user(request)
    if not user_id:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
        
    session = SessionLocal()
    try:
        items = session.query(WatchlistModel).filter_by(user_id=user_id).all()
        results = []
        for w in items:
            t = w.trend
            if t:
                has_surge_alert = t.velocity >= w.alert_threshold
                results.append({
                    "id": w.id,
                    "trendId": t.id,
                    "alertThreshold": w.alert_threshold,
                    "hasSurgeAlert": has_surge_alert,
                    "createdAt": w.created_at.isoformat(),
                    "trend": t.to_dict(include_articles=False, include_history=False)
                })
        return jsonify({"success": True, "watchlist": results})
    finally:
        session.close()

@app.route('/api/watchlist/toggle', methods=['POST'])
def toggle_watchlist():
    """Follows or unfollows a trend for the user."""
    user_id = get_current_user(request)
    if not user_id:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
        
    data = request.get_json(silent=True) or {}
    trend_id = data.get('trendId')
    threshold = float(data.get('alertThreshold', 50.0))
    
    if not trend_id:
        return jsonify({"success": False, "error": "trendId is required"}), 400
        
    session = SessionLocal()
    try:
        existing = session.query(WatchlistModel).filter_by(user_id=user_id, trend_id=trend_id).first()
        if existing:
            session.delete(existing)
            session.commit()
            return jsonify({"success": True, "action": "removed", "following": False})
        else:
            w = WatchlistModel(user_id=user_id, trend_id=trend_id, alert_threshold=threshold)
            session.add(w)
            session.commit()
            return jsonify({"success": True, "action": "added", "following": True})
    finally:
        session.close()

# ----------------- MULTI-SOURCE ENGINE STATUS & REFRESH ----------------- #

@app.route('/api/sources/status', methods=['GET'])
def get_sources_status():
    """Returns live connection and throughput status of all 5 supported data connectors."""
    statuses = get_source_connection_statuses()
    return jsonify({
        "success": True,
        "sources": statuses,
        "activeCount": sum(1 for s in statuses if s["status"] == "connected"),
        "totalCount": len(statuses),
        "timestamp": datetime.utcnow().isoformat()
    })

@app.route('/api/trends/refresh', methods=['POST'])
def refresh_trends():
    """Forces live multi-source ingestion from Google News, HackerNews, and Google Trends."""
    try:
        result = run_full_ingestion()
        return jsonify({
            "success": True,
            "message": "Successfully refreshed live trends from all connected multi-source feeds.",
            "data": result
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "online",
        "service": "TrendTide Multi-Domain Live Trends & AI Forecasting Platform",
        "version": "4.0.0",
        "domains": 10,
        "sources": ["Google News RSS", "HackerNews Firebase API", "Google Trends RSS", "X API v2 (Standby)", "Reddit API (Standby)"]
    })

# ----------------- STATIC SPA SERVING ----------------- #

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_client(path):
    if path != "" and os.path.exists(os.path.join(CLIENT_DIST, path)):
        return send_from_directory(CLIENT_DIST, path)
    if os.path.exists(os.path.join(CLIENT_DIST, 'index.html')):
        return send_from_directory(CLIENT_DIST, 'index.html')
    return jsonify({
        "status": "TrendTide API Server running",
        "notice": "Frontend client dist not found. Please build frontend with 'npm run build'."
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting TrendTide Live Trends Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
