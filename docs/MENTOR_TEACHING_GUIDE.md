# TrendTide — Mentor Live-Coding & Teaching Guide

## 1. Pedagogical Mission
As a mentor, your goal is to demystify time-series analytics, growth metrics, and predictive forecasting for students. Guide students to see the contrast between naive hype-tracking and rigorous statistical engineering.

---

## 2. Lecture Modules & Code Walkthrough Roadmap

### Module 1: The Anatomy of a Trend (Theory)
- **Concept:** Why volume alone lies. A topic with 1,000,000 mentions that is declining -20% weekly is dying, whereas a topic with 5,000 mentions doubling every week is an emerging tsunami.
- **Formulas:** Show the first derivative (Velocity) and second derivative (Acceleration).
- **Interactive Question to Ask Students:**
  > *"If Topic A has 100,000 mentions and growing +2% per day, and Topic B has 2,000 mentions and growing +25% per day, which will peak first, and which should an early-stage investor care about?"*

### Module 2: The Phase 1 Frontend Tour (Live Coding)
- **Concept:** Enterprise dashboard design, responsive layouts, accessible typography, and managing simulated data states.
- **Code Highlights:**
  - `src/components/Navbar.tsx`: Clear "Simulated Mode" indicator.
  - `src/pages/TopicDetail.tsx`: Interactive SVG rendering of 30-day time series and moving averages without bloated heavyweight libraries.
  - `src/pages/ForecastView.tsx`: How to visually represent confidence intervals ($80\%$ and $95\%$) to teach students that forecasting is probabilistic, never deterministic.

### Module 3: Avoiding the Data Leakage Trap (Preparing for Phase 6)
- **Concept:** Why `train_test_split(shuffle=True)` is fatal in time series.
- **Demo:** Show rolling-origin temporal cross-validation.

---

## 3. Student Checkpoint Exercises
1. **Exercise 1 (Frontend):** In `TopicDetail.tsx`, modify the moving average smoothing window from 7 days to 14 days and observe how high-frequency noise is dampened.
2. **Exercise 2 (Analytics):** Calculate the sMAPE between the Holt-Winters prediction and the naive baseline on paper for 3 sample days.
3. **Exercise 3 (Ethics):** Write a 1-paragraph disclaimer for why a forecast model cannot guarantee whether an AI startup will go viral on Twitter.
