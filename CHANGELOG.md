# TrendTide — Changelog

All notable changes to the TrendTide project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-10-26 (Phase 1 Frontend Delivery)
### Added
- Complete React 18 + Vite + TypeScript frontend interface running on port 3001.
- Global simulated demo mode banner ensuring ethical transparency.
- Authentication suite: Login, Register, Forgot Password, and Reset Password views with interactive form states.
- Operational Dashboard: High-level KPIs, trending velocity rankings, activity volume overview, and quick filters.
- Trend Explorer: Search query filters, category tags (AI/ML, Web3, DevTools, Biotech, Energy), velocity sorting, and data volume filters.
- Topic Detail View: Interactive SVG time-series visualization showing 30-day historical mentions, 7-day EMA, and volume spikes.
- Forecast Analytics Page: Statistical projections (Holt-Winters vs Baseline Moving Average) with shaded 80% and 95% confidence intervals and an uncertainty disclosure callout.
- Recommendation Engine Panel: Transparent multi-factor weighting sliders and cold-start fallback explanations.
- Watchlist & History: Interactive topic tracking and past query review.
- Settings & Preferences: Configurable alert thresholds, dark/navy theme toggles, and notification preferences.
- System Pages: 403 Unauthorized view and 404 Not Found view with recovery navigation.

## [0.1.0] - 2026-10-26 (Phase 0 Planning)
### Added
- Created `PROJECT_PLAN.md`, `PROJECT_STRUCTURE.md`, `ROADMAP.md`, `SECURITY.md`, and technical design reports (`PDR.md`, `TDR.md`).
- Defined mathematical formulas for Growth Velocity ($V_t$), Momentum ($A_t$), and Burstiness Ratio ($S_t$).
- Established chronological rolling-origin validation requirements to prevent data leakage.
