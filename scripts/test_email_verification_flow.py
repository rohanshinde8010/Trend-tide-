import getpass
import os
import sys

import requests
from dotenv import load_dotenv

load_dotenv()

BASE = os.getenv("AUTH_TEST_BASE_URL", "http://127.0.0.1:5001").rstrip("/")
EMAIL = os.getenv("AUTH_TEST_EMAIL", "").strip()
NAME = os.getenv("AUTH_TEST_NAME", "").strip() or input("Full name for test account: ").strip()
if not EMAIL:
    EMAIL = input("Real email address for this test (use a new address/alias): ").strip()
PASSWORD = getpass.getpass("Test password (8+ characters): ")

if not EMAIL or len(PASSWORD) < 8:
    raise SystemExit("A valid real email address and password of at least 8 characters are required.")

client = requests.Session()
registration = client.post(
    f"{BASE}/api/auth/register",
    json={"name": NAME, "email": EMAIL, "password": PASSWORD, "confirmPassword": PASSWORD},
    timeout=35,
)
assert registration.status_code == 201, f"Registration/email delivery failed: {registration.text}"
assert registration.json().get("requiresVerification") is True
assert "token" not in registration.json()
print("[PASS] Registration accepted and SMTP provider accepted the verification email.")

unverified_login = client.post(
    f"{BASE}/api/auth/login",
    json={"email": EMAIL, "password": PASSWORD},
    timeout=15,
)
assert unverified_login.status_code == 403
assert unverified_login.json().get("error") == "Please verify your email before logging in."
print("[PASS] Login is blocked before email verification.")

resend = client.post(
    f"{BASE}/api/auth/resend-verification",
    json={"email": EMAIL},
    timeout=35,
)
assert resend.status_code == 200 and resend.json().get("success")
print("[PASS] Resend verification completed. Use the newest message; earlier links are invalidated.")
input("Open the newest verification email, confirm the link in the browser, then press Enter here: ")

login = client.post(
    f"{BASE}/api/auth/login",
    json={"email": EMAIL, "password": PASSWORD},
    timeout=15,
)
assert login.status_code == 200 and login.json().get("success")
assert login.json().get("user", {}).get("isVerified") is True
assert "trendtide_session" in client.cookies
assert "HttpOnly" in login.headers.get("Set-Cookie", "")
print("[PASS] Verified login sets an HttpOnly session cookie.")

current_user = client.get(f"{BASE}/api/auth/me", timeout=15)
assert current_user.status_code == 200
print("[PASS] Protected session endpoint accepts the authenticated cookie.")

logout = client.post(f"{BASE}/api/auth/logout", timeout=15)
assert logout.status_code == 200 and logout.json().get("success")
assert client.get(f"{BASE}/api/auth/me", timeout=15).status_code == 401
print("[PASS] Logout clears the cookie and protected access is denied.")

reset_request = client.post(
    f"{BASE}/api/auth/forgot-password",
    json={"email": EMAIL},
    timeout=35,
)
assert reset_request.status_code == 200 and reset_request.json().get("success")
new_password = getpass.getpass("Enter the new password you will set from the reset email: ")
if len(new_password) < 8:
    raise SystemExit("Password must contain at least 8 characters.")
input("Open the password-reset email and submit the new password in the browser, then press Enter: ")

reset_login = client.post(
    f"{BASE}/api/auth/login",
    json={"email": EMAIL, "password": new_password},
    timeout=15,
)
assert reset_login.status_code == 200 and reset_login.json().get("success")
assert client.get(f"{BASE}/api/auth/me", timeout=15).status_code == 200
client.post(f"{BASE}/api/auth/logout", timeout=15)
assert client.get(f"{BASE}/api/auth/me", timeout=15).status_code == 401
print("[PASS] Password reset, new-password login, and post-logout protection completed.")
print("Reload the used verification/reset links to confirm they cannot be reused. To check expiry, request a fresh link, wait 16 minutes, and then confirm it is rejected.")
