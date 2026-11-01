"""
TrendTide Database Setup and SQLAlchemy Models
Multi-Domain Live Trend Discovery & Forecasting Architecture
"""
import os
import uuid
from datetime import datetime
import bcrypt
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from werkzeug.security import check_password_hash

Base = declarative_base()

class UserModel(Base):
    __tablename__ = 'users'
    
    id = Column(String(50), primary_key=True)
    email = Column(String(254), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(120), nullable=False)
    role = Column(String(50), default="Lead Trend Strategist")
    avatar_url = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String(10), nullable=True)
    verification_expires_at = Column(DateTime, nullable=True)
    email_verification_token_hash = Column(String(64), nullable=True)
    email_verification_expires_at = Column(DateTime, nullable=True)
    password_reset_token_hash = Column(String(64), nullable=True)
    password_reset_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    def set_password(self, password: str):
        self.password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("ascii")

    def check_password(self, password: str) -> bool:
        if self.password_hash.startswith(("$2a$", "$2b$", "$2y$")):
            try:
                return bcrypt.checkpw(password.encode("utf-8"), self.password_hash.encode("ascii"))
            except ValueError:
                return False
        try:
            return check_password_hash(self.password_hash, password)
        except ValueError:
            return False

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "fullName": self.full_name,
            "role": self.role,
            "avatarUrl": self.avatar_url,
            "isVerified": bool(getattr(self, 'is_verified', False)),
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "lastLogin": self.last_login.isoformat() if self.last_login else None
        }

class DomainModel(Base):
    __tablename__ = 'domains'

    id = Column(String(50), primary_key=True) # e.g. tech-ai, cybersecurity
    name = Column(String(100), nullable=False) # e.g. "Technology & AI"
    slug = Column(String(100), nullable=False, unique=True)
    icon = Column(String(50), default="trending_up")
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)

    trend_items = relationship("TrendItemModel", back_populates="domain", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "icon": self.icon,
            "description": self.description,
            "orderIndex": self.order_index,
            "trendCount": len(self.trend_items) if self.trend_items else 0
        }

class TrendItemModel(Base):
    __tablename__ = 'trend_items'

    id = Column(String(80), primary_key=True)
    domain_id = Column(String(50), ForeignKey('domains.id'), nullable=False, index=True)
    hashtag = Column(String(100), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    rank = Column(Integer, default=1)
    global_rank = Column(Integer, default=1)
    volume_count = Column(Integer, default=0)
    volume_display = Column(String(50), default="0 posts")
    velocity = Column(Float, default=0.0) # growth rate %
    acceleration = Column(Float, default=0.0)
    trajectory = Column(String(30), default="surging") # surging, rising, peaking, steady, declining
    sentiment_score = Column(Float, default=0.0) # -1.0 to +1.0
    primary_source = Column(String(150), default="Live News Aggregator")
    primary_source_url = Column(String(500), nullable=True)
    source_platform = Column(String(50), default="news") # news, hackernews, google_trends, x, reddit
    region = Column(String(50), default="worldwide", index=True) # worldwide, us, in, uk, eu, apac, latam
    is_breaking = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow)

    domain = relationship("DomainModel", back_populates="trend_items")
    articles = relationship("TrendArticleModel", back_populates="trend", cascade="all, delete-orphan")
    history_points = relationship("TrendHistoryModel", back_populates="trend", cascade="all, delete-orphan", order_by="TrendHistoryModel.id")

    def to_dict(self, include_articles: bool = True, include_history: bool = True):
        data = {
            "id": self.id,
            "domainId": self.domain_id,
            "domainName": self.domain.name if self.domain else self.domain_id,
            "hashtag": self.hashtag,
            "title": self.title,
            "summary": self.summary,
            "rank": self.rank,
            "globalRank": self.global_rank,
            "volumeCount": self.volume_count,
            "volumeDisplay": self.volume_display,
            "velocity": self.velocity,
            "acceleration": self.acceleration,
            "trajectory": self.trajectory,
            "sentimentScore": self.sentiment_score,
            "primarySource": self.primary_source,
            "primarySourceUrl": self.primary_source_url,
            "sourcePlatform": self.source_platform,
            "region": getattr(self, 'region', None) or "worldwide",
            "isBreaking": self.is_breaking,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "lastUpdated": self.last_updated.isoformat() if self.last_updated else None,
            "articleCount": len(self.articles) if self.articles else 0
        }
        if include_articles and self.articles:
            data["articles"] = [a.to_dict() for a in self.articles]
        if include_history and self.history_points:
            data["history"] = [h.to_dict() for h in self.history_points]
        return data

class TrendArticleModel(Base):
    __tablename__ = 'trend_articles'

    id = Column(Integer, primary_key=True, autoincrement=True)
    trend_id = Column(String(80), ForeignKey('trend_items.id'), nullable=False, index=True)
    title = Column(String(300), nullable=False)
    source_name = Column(String(120), nullable=False)
    source_url = Column(String(500), nullable=False)
    published_at = Column(String(80), nullable=True)
    snippet = Column(Text, nullable=True)
    platform = Column(String(50), default="Google News")

    trend = relationship("TrendItemModel", back_populates="articles")

    def to_dict(self):
        return {
            "id": self.id,
            "trendId": self.trend_id,
            "title": self.title,
            "sourceName": self.source_name,
            "sourceUrl": self.source_url,
            "publishedAt": self.published_at,
            "snippet": self.snippet,
            "platform": self.platform
        }

class TrendHistoryModel(Base):
    __tablename__ = 'trend_history'

    id = Column(Integer, primary_key=True, autoincrement=True)
    trend_id = Column(String(80), ForeignKey('trend_items.id'), nullable=False, index=True)
    timestamp = Column(String(60), nullable=False)
    volume = Column(Float, nullable=False)
    velocity = Column(Float, default=0.0)
    popularity_score = Column(Float, default=50.0)

    trend = relationship("TrendItemModel", back_populates="history_points")

    def to_dict(self):
        return {
            "id": self.id,
            "trendId": self.trend_id,
            "timestamp": self.timestamp,
            "volume": self.volume,
            "velocity": self.velocity,
            "popularityScore": self.popularity_score
        }

class WatchlistModel(Base):
    __tablename__ = 'watchlist'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), ForeignKey('users.id'), nullable=False, index=True)
    trend_id = Column(String(80), ForeignKey('trend_items.id'), nullable=False, index=True)
    alert_threshold = Column(Float, default=50.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    trend = relationship("TrendItemModel")

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "trendId": self.trend_id,
            "alertThreshold": self.alert_threshold,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "trend": self.trend.to_dict(include_articles=False, include_history=False) if self.trend else None
        }

# Retain legacy TopicModel & DataPointModel compatibility for safety
class TopicModel(Base):
    __tablename__ = 'topics'
    
    id = Column(String(50), primary_key=True)
    title = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    current_volume = Column(Integer, default=0)
    velocity = Column(Float, default=0.0)
    acceleration = Column(Float, default=0.0)
    sentiment_score = Column(Float, default=0.0)
    growth_rate = Column(Float, default=0.0)
    direction = Column(String(20), default="surging")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    data_points = relationship("DataPointModel", back_populates="topic", cascade="all, delete-orphan")

class DataPointModel(Base):
    __tablename__ = 'data_points'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    topic_id = Column(String(50), ForeignKey('topics.id'), nullable=False)
    timestamp = Column(String(50), nullable=False)
    value = Column(Float, nullable=False)
    ma7 = Column(Float, nullable=True)
    velocity = Column(Float, nullable=True)
    
    topic = relationship("TopicModel", back_populates="data_points")

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "trendtide.db")
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    DATABASE_URL = f"sqlite:///{DB_PATH}"

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
    migrate_auth_schema()


def migrate_auth_schema():
    """Upgrade existing user tables while preserving the existing database."""
    if "users" not in inspect(engine).get_table_names():
        return

    datetime_type = "TIMESTAMP" if engine.dialect.name == "postgresql" else "DATETIME"
    column_definitions = {
        "email_verification_token_hash": "VARCHAR(64)",
        "email_verification_expires_at": datetime_type,
        "password_reset_token_hash": "VARCHAR(64)",
        "password_reset_expires_at": datetime_type,
        "updated_at": datetime_type,
    }

    with engine.begin() as connection:
        existing_columns = {column["name"] for column in inspect(connection).get_columns("users")}
        is_legacy_auth_schema = "email_verification_token_hash" not in existing_columns
        for column_name, column_type in column_definitions.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"))

        if is_legacy_auth_schema:
            connection.execute(text(
                "UPDATE users SET is_verified = FALSE, verification_code = NULL, "
                "verification_expires_at = NULL"
            ))
            connection.execute(text("UPDATE users SET email = LOWER(email)"))

        if engine.dialect.name == "postgresql":
            connection.execute(text("ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(254)"))

        connection.execute(text(
            "UPDATE users SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)"
        ))
        connection.execute(text(
            "CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower ON users (LOWER(email))"
        ))
