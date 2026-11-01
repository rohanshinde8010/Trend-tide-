# TrendTide — Catch a Trend Before It Peaks 📈🌊

> **Educational Analytics SaaS Platform for Time-Series Analysis, Growth Velocity Detection, and Honest Forecasting.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Phase](https://img.shields.io/badge/Phase-Phase%201%20(Frontend%20Active)-emerald.svg)]()

---

## 🚀 Overview
TrendTide empowers researchers, product strategists, and data science students to track emerging topics before they reach mainstream saturation. Unlike superficial social trackers that confuse raw volume with genuine growth, TrendTide applies rigorous mathematical metrics:
- **Velocity ($\Delta Y / \Delta t$):** Normalized first derivative of topic mentions.
- **Momentum / Acceleration ($\Delta^2 Y / \Delta t^2$):** Rate of growth change, catching inflection points early.
- **Burstiness Index ($\mu / \sigma$):** Distinguishing short-lived viral spikes from sustainable adoption curves.
- **Honest Forecasting:** Evaluated against naive baselines with transparent 80% and 95% confidence intervals.

---

## 📁 Repository Structure
```
trendtide/
├── client/              # Phase 1: Interactive React/TS/Tailwind dashboard
├── server/              # Phase 2: Flask REST API (Planned)
├── data_ingestion/      # Phase 3: Permitted API adapters (Planned)
├── data_processing/     # Phase 4: Time-series cleaners & aggregators (Planned)
├── trend_engine/        # Phase 5: Velocity & momentum algorithms (Planned)
├── forecasting/         # Phase 6: Statistical baselines & evaluation (Planned)
├── recommendations/     # Phase 7: Multi-factor ranking (Planned)
├── database/            # Phase 8: SQLAlchemy models & migrations (Planned)
├── tests/               # Phase 10: Pytest & UI test suites (Planned)
└── docs/                # PDR, TDR, User Guide & Mentor Teaching Manual
```

---

## 💻 Running TrendTide

### Prerequisites
- Node.js $\ge 20$
- npm $\ge 9$
- Python $\ge 3.10$

### Configure email authentication
The API uses Flask/SQLAlchemy and sends verification and password-reset links through Nodemailer over SMTP. Copy the example environment file and set a unique JWT secret plus your SMTP provider credentials:

```powershell
Copy-Item .env.example .env
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Put the generated value in `JWT_SECRET`. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`. For Gmail, use `smtp.gmail.com`, port `587`, `SMTP_SECURE=false`, and a Google App Password (not your account password). Keep `.env` private.

For local development, keep `APP_BASE_URL=http://localhost:3001` and `SESSION_COOKIE_SECURE=false`. The Vite development server proxies `/api` requests to Flask on port 5001.

### Start the application
Install dependencies once, then start the backend and frontend in separate PowerShell terminals:

```powershell
pip install -r requirements.txt
Set-Location client
npm ci
npm run dev
```

```powershell
# From the project root in another terminal
python run_server.py
```

Open **http://localhost:3001**. Registration creates an unverified account and reports success only after SMTP accepts the verification message. If delivery fails, the account remains unverified and the page offers a resend action. The email link opens a confirmation page; the address is marked verified only after the user confirms there. Verification and password-reset links are single-use and expire after 15 minutes. Unverified users cannot sign in. Accounts migrated from the legacy verification schema must verify their email again.

For production, set `APP_ENV=production`, `APP_BASE_URL` to the HTTPS application URL, and `SESSION_COOKIE_SECURE=true`. Use a strong persistent `JWT_SECRET` and configure `RATELIMIT_STORAGE_URI` to a shared Redis service; production startup rejects the process-local memory limiter. Docker Compose reads secrets from the untracked `.env` file.

The authentication API is rooted at `/api/auth`: `register`, `verify-email`, `resend-verification`, `login`, `logout`, `me`, `forgot-password`, and `reset-password`. Passwords use bcrypt; raw email and reset tokens are never stored. Authentication uses a 15-minute HttpOnly, SameSite=Lax cookie rather than browser storage.

To exercise the live email workflow, configure SMTP and run `python scripts/test_email_verification_flow.py` with the backend running. It registers a real test address, verifies the unverified-login denial and resend flow, then pauses for the verification and reset links to be completed in the browser before checking authenticated and logged-out access. Use a new address/alias for each run.

Trend data availability depends on the configured application data sources; email authentication is live and is not simulated.
