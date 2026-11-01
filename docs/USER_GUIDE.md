# TrendTide — User & Student Guide

## 1. Getting Started
Welcome to **TrendTide**! This analytics SaaS platform helps you identify, evaluate, and forecast emerging trends across technology, AI, open source, and science.

---

## 2. Navigating the Interface

### 2.1 The Simulated Demonstration Banner
Across the top of the interface is an alert badge indicating **"SIMULATED DEMO MODE"**. All datasets, mention frequencies, velocity rates, and forecast ranges are synthetic illustrative fixtures designed for pedagogy in Phase 1.

### 2.2 Operational Dashboard (`/`)
- **Key Performance Indicators (KPIs):** Total monitored topics, average ecosystem velocity, high-momentum breakout alerts, and forecast accuracy benchmarks against naive baselines.
- **Top Velocity Movers:** A ranked preview of topics accelerating the fastest over the last 7 days.

### 2.3 Trend Explorer (`/explorer`)
- **Category Filters:** Filter by AI & Machine Learning, Cloud & Infrastructure, Web3 & Crypto, Developer Tools, or Green Tech.
- **Velocity Thresholds:** Sliders to isolate breakout topics ($> 50\%$ growth) versus steady linear trends.
- **Search Bar:** Instant real-time filtering by topic keyword.

### 2.4 Topic Details (`/topic/:id`)
- **Interactive SVG Time-Series Chart:** Visualizes daily observation counts along with the 7-day Exponential Moving Average (EMA).
- **Metric Cards:** Current Velocity, 14-day Acceleration, Burstiness Score, and Signal Sustainability classification.

### 2.5 Forecast Explorer (`/forecast`)
- Compare model outputs (Holt-Winters statistical smoothing vs. 14-day Moving Average Baseline).
- View 80% and 95% uncertainty envelope bands.
- Read explicit forecasting caveats and error margin notes.

### 2.6 Recommendations (`/recommendations`)
- Explore personalized topic recommendations scored using a transparent formula combining velocity, consistency, and category affinity.

### 2.7 Watchlist (`/watchlist`) & Settings (`/settings`)
- Bookmark emerging topics to your active monitoring list.
- Adjust alert sensitivity and theme settings.
