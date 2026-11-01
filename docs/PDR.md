# TrendTide — Project Design Report (PDR)
**Version:** 1.0.0-Draft (Phase 0/1)  
**Author:** Antigravity AI & Piyush  
**Date:** October 2026  

---

## 1. Project Background & Rationale
Trend detection is frequently misunderstood in modern media. Products often highlight whatever received millions of impressions today, even if that topic has already peaked and is declining. For decision-makers and innovators, what matters is the *inflection point*—the moment an idea or technology shifts from low baseline activity to sustainable geometric growth.

**TrendTide** was conceived as an open, educational platform that pairs real-world time-series methodologies with an intuitive, executive-grade user interface.

## 2. Functional Requirements
1. **Multi-Source Topic Observation:** Ingest time-series count data across discrete time intervals (hourly, daily) from documented public sources.
2. **Growth Metrics Calculation:** Compute rolling exponential moving averages, rate of change (velocity), acceleration (momentum), and signal stability.
3. **Spike vs. Sustained Trend Differentiation:** Heuristically and statistically distinguish single-event anomalies (e.g., a scandal or sudden product leak) from steady compound adoption.
4. **Time-Series Forecasting:** Produce 7-day to 30-day ahead forecasts using statistical methods, providing prediction intervals (80% and 95%) rather than deceptive single-point forecasts.
5. **Topic Recommendation:** Suggest emerging topics aligned with a user's selected domain tags, prioritizing early-stage momentum.
6. **Watchlist & Alerts:** Allow users to monitor designated topics and receive notifications when acceleration exceeds configurable thresholds.

## 3. User Interface Design System
- **Color Palette:** Deep Navy (`#0f172a`, `#1e293b`), Slate Cool Grays (`#64748b`, `#f1f5f9`), Electric Blue accents (`#2563eb`, `#3b82f6`), Emerald Green for positive velocity (`#10b981`), and Rose Red for negative velocity (`#f43f5e`).
- **Typography:** Modern sans-serif with tabular numeric figures for clean chart alignments.
- **Micro-Interactions:** Smooth card hover elevations, interactive tooltip highlights on time-series charts, and responsive sidebar navigation.
- **Transparency Indicator:** Persistent badge alerting the user that the system is running in "Phase 1: Simulated Demonstration Mode".

## 4. Evaluation Strategy
- **Baselines:** Any ML or statistical model must be compared against a Naive persistence baseline ($Y_{t+h} = Y_t$) and a Drift model.
- **Metrics:** Symmetric Mean Absolute Percentage Error (sMAPE) and Mean Absolute Scaled Error (MASE) to handle near-zero baseline volume.
- **Chronological Splitting:** Strict temporal splits (e.g., Train: Days 1-60, Test: Days 61-90). No future data leakage permitted.
