# TrendTide — Master Project Plan (Phase 0 & Beyond)
**Sub-title:** Catch a Trend Before It Peaks: Time-Series Analytics & Forecasting Platform  
**Status:** Phase 0 (Planning Completed) & Phase 1 (Frontend In Progress)  
**Author / Lead Architect:** Antigravity AI & Piyush  
**Classification:** Educational Production-Grade Analytics SaaS  

---

## 1. Executive Summary & Problem Statement
Identifying emerging themes, technologies, and market movements before they reach peak saturation is a decisive advantage for researchers, product managers, and content strategists. However, existing tools often conflate *current raw popularity* with *true growth velocity*, or falsely treat temporary noise spikes as sustainable trends.

**TrendTide** is an end-to-end analytics platform engineered to:
1. Ingest temporal observation data from permitted sources (e.g., GitHub trends, arXiv research papers, Wikipedia pageviews, and open event streams).
2. Calculate rigorous growth metrics (Rolling Averages, Relative Momentum, Acceleration, and Signal-to-Noise Ratios).
3. Distinguish temporary spikes from sustained momentum.
4. Generate baseline forecasts (Naive, Moving Average, Exponential Smoothing, and Holt-Winters) with honest uncertainty bounds (80% and 95% prediction intervals).
5. Deliver personalized recommendations using transparent scoring without over-promising viral prediction.

---

## 2. Target Users & Educational Persona
- **Data Science Students:** Learn time-series decomposition, stationary transforms, baseline forecasting, and rolling-origin evaluation.
- **Full-Stack Engineering Students:** Master clean separation of concerns across React/TypeScript clients, Flask REST APIs, async pipelines, and PostgreSQL persistence.
- **Product & Business Analysts:** Understand velocity, momentum, inflection points, and how to read forecast confidence bands responsibly.

---

## 3. Scope & Phased Implementation Matrix

| Phase | Description | Status | Deliverables |
|---|---|---|---|
| **Phase 0** | Project Planning & Architecture Definition | **Active / Complete** | `PROJECT_PLAN.md`, `PROJECT_STRUCTURE.md`, `ROADMAP.md`, `SECURITY.md`, `CHANGELOG.md`, `PDR.md`, `TDR.md` |
| **Phase 1** | Frontend SaaS Dashboard (Demo / Mock Mode) | **Active (Today)** | 10+ Complete React/Tailwind/Lucide views, interactive charts, persistent demo indicators, full responsive design |
| **Phase 2** | Backend Flask Architecture & Service Layer | Planned | Flask application factory, blueprinted REST API, request schema validation (Marshmallow/Pydantic), error handlers |
| **Phase 3** | Data Ingestion Adapters | Planned | Permitted public data source connectors (e.g., Wikimedia Pageviews API, GitHub Archive, arXiv API) with backoff rate-limiting |
| **Phase 4** | Data Processing & Feature Engineering | Planned | Aggregation windowing (hourly/daily), outlier winsorization, missing interval imputation, schema validation |
| **Phase 5** | Trend & Velocity Engine | Planned | First-order velocity $\Delta$, second-order acceleration $\Delta^2$, 7-day/28-day rolling EMA, Burstiness Index |
| **Phase 6** | Time-Series Forecasting & Validation | Planned | Chronological rolling-origin train/test splits, statistical baselines, sMAPE/MASE evaluation, prediction intervals |
| **Phase 7** | Recommendation Engine | Planned | Multi-factor weighted ranking (Velocity 40%, Acceleration 25%, Consistency 20%, Interest Affinity 15%) |
| **Phase 8** | Database Persistence & Auth | Planned | PostgreSQL schemas (SQLAlchemy ORM), Alembic migrations, bcrypt password hashing, JWT/Session tokens |
| **Phase 9** | System Integration & End-to-End Wiring | Planned | UI connected to live Flask API with caching and latency optimization |
| **Phase 10** | Comprehensive Testing Suite | Planned | Unit tests (pytest), forecast evaluation benchmarks, Vitest frontend tests, Cypress/Playwright E2E |
| **Phase 11** | Production Deployment & DevOps | Planned | Docker Compose, Nginx reverse proxy, PostgreSQL container, Gunicorn WSGI, health checks |
| **Phase 12** | Handover, Mentorship & Student Lab Manuals | Planned | Student exercises, step-by-step code walkthroughs, exportable PDF guides |

---

## 4. Key Mathematical Formulations

### 4.1 Growth Velocity ($V_t$)
Given normalized topic volume $Y_t$ at time $t$ over window $k$:
$$V_t = \frac{EMA_7(Y_t) - EMA_7(Y_{t-k})}{EMA_7(Y_{t-k}) + \epsilon}$$
Where $\epsilon$ prevents division by zero in low-volume topics.

### 4.2 Acceleration / Momentum ($A_t$)
$$A_t = V_t - V_{t-k}$$
Positive acceleration indicates an emerging inflection point, while negative acceleration signals peak deceleration.

### 4.3 Burstiness vs. Sustained Ratio ($S_t$)
$$S_t = \frac{\mu_{window}}{\sigma_{window} + \epsilon}$$
A high standard deviation relative to mean indicates a short-lived viral spike, whereas steady growth exhibits lower volatility.

---

## 5. Non-Functional Requirements & Guardrails
- **No False Claims:** Forecasts explicitly note uncertainty; never guarantee viral outcomes.
- **Data Provenance:** Every observation retains source attribution, ingestion timestamp, and confidence score.
- **Performance:** Frontend initial load $< 800\text{ms}$; dashboard renders at 60 FPS.
- **Accessibility:** WCAG 2.1 AA compliant typography and contrast ratios.
