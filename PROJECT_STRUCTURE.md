# TrendTide — Project Structure & File Layout

This document delineates the architectural layout of the **TrendTide** repository, maintaining clear boundaries between data collection, processing, analytics, forecasting, recommendation, and presentation layers.

```
trendtide/
├── client/                     # Phase 1: Vite + React + TypeScript + Tailwind Frontend
│   ├── index.html              # Single Page Application entrypoint
│   ├── package.json            # Client workspace dependencies
│   ├── postcss.config.js       # PostCSS Tailwind plugins
│   ├── tailwind.config.js      # Navy/Blue analytics design tokens
│   ├── tsconfig.json           # Client TypeScript configuration
│   ├── vite.config.ts          # Vite build & proxy settings (Port 3001)
│   └── src/
│       ├── main.tsx            # React DOM mounting
│       ├── App.tsx             # Route orchestration & Navigation guards
│       ├── index.css           # Global typography & design utilities
│       ├── types/              # Domain models (Topic, Forecast, Metric)
│       ├── data/               # Simulated time-series mock data & scenarios
│       ├── components/         # Reusable UI (Sidebar, Navbar, Banner, MetricCards)
│       └── pages/              # View controllers
│           ├── Dashboard.tsx         # Overview KPIs & velocity distribution
│           ├── TrendExplorer.tsx     # Filterable, sortable emerging topics list
│           ├── TopicDetail.tsx       # Historical time-series & momentum metrics
│           ├── ForecastView.tsx      # Multi-model forecast & 80/95% confidence intervals
│           ├── Recommendations.tsx   # Personalized & velocity-weighted suggestions
│           ├── Watchlist.tsx         # Tracked topics & observation history
│           ├── Settings.tsx          # Model thresholds, alerts, and preferences
│           ├── Login.tsx             # Simulated authentication
│           ├── Register.tsx          # Account onboarding
│           ├── ForgotPassword.tsx    # Recovery workflow
│           ├── ResetPassword.tsx     # Credential reset
│           ├── Unauthorized.tsx      # 403 Access control view
│           └── NotFound.tsx          # 404 Error handler view
│
├── server/                     # Phase 2: Flask REST API Architecture (Planned)
│   ├── app.py                  # Application factory (`create_app`)
│   ├── config.py               # Environment configuration & secret handling
│   ├── routes/                 # Blueprinted REST endpoints
│   │   ├── auth.py             # Authentication & user profile endpoints
│   │   ├── topics.py           # Topic observation & query endpoints
│   │   ├── metrics.py          # Velocity, momentum & burstiness endpoints
│   │   └── forecast.py         # Model inference endpoints
│   └── middleware/             # Rate limiting, logging & error interception
│
├── data_ingestion/             # Phase 3: Data Source Adapters (Planned)
│   ├── base.py                 # Abstract SourceAdapter interface
│   ├── wikimedia_adapter.py    # Wikimedia Pageviews API client with backoff
│   ├── github_adapter.py       # GitHub REST/GraphQL trending topics client
│   └── arxiv_adapter.py        # arXiv papers harvest client
│
├── data_processing/            # Phase 4: Data Pipeline & Cleaning (Planned)
│   ├── cleaner.py              # Timestamp UTC normalization & deduplication
│   ├── aggregator.py           # Hourly to daily bucketing & missing interval fill
│   └── quality_checker.py      # Schema validation & anomalous null detection
│
├── trend_engine/               # Phase 5: Trend & Velocity Algorithms (Planned)
│   ├── smoothing.py            # Exponential Moving Averages (EMA) & Savitzky-Golay
│   ├── velocity.py             # 1st-order rate-of-change calculation
│   ├── momentum.py             # 2nd-order acceleration calculation
│   └── spike_detector.py       # Z-score & burstiness ratio differentiation
│
├── forecasting/                # Phase 6: Time-Series Forecasting & Validation (Planned)
│   ├── baselines.py            # Naive, Drift, and Rolling Mean baselines
│   ├── statistical.py          # Holt-Winters Exponential Smoothing & ARIMA
│   ├── evaluation.py           # Chronological rolling-origin split & sMAPE / MASE
│   └── intervals.py            # Bootstrapped & analytical prediction intervals
│
├── recommendations/            # Phase 7: Multi-factor Topic Ranking (Planned)
│   ├── scoring.py              # Normalized composite ranking engine
│   └── cold_start.py           # Default topic fallbacks for new users
│
├── database/                   # Phase 8: Persistence & Migrations (Planned)
│   ├── models.py               # SQLAlchemy ORM entities (User, Topic, Observation)
│   └── migrations/             # Alembic migration scripts
│
├── tests/                      # Phase 10: Pytest & Frontend Test Suites (Planned)
│   ├── test_ingestion.py       # Adapter mocking & pagination tests
│   ├── test_metrics.py         # Mathematical verification of velocity & momentum
│   ├── test_forecast.py        # No future-leakage verification tests
│   └── test_api.py             # Route integration & error handling tests
│
├── docs/                       # Technical Documentation & Reports
│   ├── PDR.md                  # Project Design/Development Report
│   ├── TDR.md                  # Technical Design Report
│   ├── USER_GUIDE.md           # Student & end-user handbook
│   └── MENTOR_TEACHING_GUIDE.md# Live coding lesson plans & concept questions
│
├── PROJECT_PLAN.md             # Project requirements, roadmap & phases
├── ROADMAP.md                  # Detailed milestone tracking
├── CHANGELOG.md                # Version history & release notes
├── SECURITY.md                 # Threat modeling, privacy & responsible disclosure
└── README.md                   # Repository overview & quick start guide
```
