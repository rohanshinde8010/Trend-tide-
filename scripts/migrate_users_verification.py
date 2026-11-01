import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from dotenv import load_dotenv

load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

from database.models import init_db, engine
from sqlalchemy import inspect

init_db()

columns = {column["name"] for column in inspect(engine).get_columns("users")}
required_auth_columns = {
    "email_verification_token_hash",
    "email_verification_expires_at",
    "password_reset_token_hash",
    "password_reset_expires_at",
    "updated_at",
}
missing = required_auth_columns - columns
if missing:
    raise SystemExit(f"Authentication schema migration incomplete: {sorted(missing)}")

print("Authentication schema is up to date. Legacy accounts may need email re-verification.")
