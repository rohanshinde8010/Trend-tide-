# TrendTide — Security & Responsible Use Policy

## 1. Security Overview
TrendTide processes public observation data and user-specific interest preferences. Although public trend data is non-confidential, authentication credentials, user query histories, and API access keys require robust defensive controls.

## 2. Threat Modeling & Defensive Controls
- **Rate Limiting & DoS Protection:** Ingestion adapters employ exponential backoff with jitter and respect upstream API headers (`Retry-After`, `X-RateLimit-Remaining`).
- **Data Provenance & Integrity:** Ingested time-series records carry SHA-256 hash digests and source metadata to prevent tampering.
- **Authentication & Credential Security:** Passwords are bcrypt-hashed (work factor 12); verification/reset tokens are stored as SHA-256 hashes and expire after 15 minutes. Sessions use 15-minute JWTs in HttpOnly, SameSite=Lax cookies, marked Secure in production. Authentication endpoints are rate-limited.
- **Injection Mitigation:** All SQL queries are bound through SQLAlchemy parameterized ORM entities to prevent SQL injection.
- **Client-Side Security:** Strict Content Security Policy (CSP), sanitized innerHTML usage, and prevention of XSS vulnerabilities.

## 3. Ethical Guardrails for Predictive Analytics
- **No Guaranteed Viral Predictions:** The application explicitly labels all forecasts with uncertainty margins (80% and 95% intervals). The system disclaims any guarantee of viral emergence.
- **Transparent Heuristics:** Recommendation weights are exposed directly to users to avoid black-box algorithmic manipulation.
- **Fair Data Harvesting:** Only publicly permitted endpoints (Wikimedia API, GitHub Archive, arXiv Open OAI-PMH) are queried; no scraping of unauthorized platforms is performed.

## 4. Vulnerability Disclosure
To report a security concern, contact the security team via `security@trendtide.local`. We acknowledge reports within 48 hours and adhere to coordinated disclosure.
