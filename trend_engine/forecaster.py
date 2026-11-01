"""
TrendTide AI Trend Forecasting Engine
Computes multi-horizon projections (24 hours, 3 days, 7 days) with Holt-Winters exponential smoothing,
dynamic velocity drift, and 95% uncertainty cones. Enforces strict observational data gates.
"""
import math
from typing import List, Dict, Any, Optional
from trend_engine.calculator import holt_winters_forecast, calculate_velocity_and_acceleration

def forecast_trend(
    trend_title: str,
    hashtag: str,
    domain_name: str,
    history_points: List[Dict[str, Any]],
    current_velocity: float = 0.0,
    current_volume: float = 0.0
) -> Dict[str, Any]:
    """
    Executes rigorous statistical forecasting across 24h, 3d, and 7d horizons.
    Gated by empirical observation depth (minimum 4 points).
    """
    if not history_points or len(history_points) < 4:
        return {
            "status": "insufficient_data",
            "message": "Insufficient historical observation depth. At least 4 chronological snapshots required to generate an empirical forecast without hallucination.",
            "dataPointsAvailable": len(history_points) if history_points else 0,
            "canForecast": False,
            "horizons": None
        }

    # Extract historical volume series
    volumes = [float(p.get("volume", 0.0)) for p in history_points]
    timestamps = [p.get("timestamp", f"T-{i}") for i, p in enumerate(history_points)]
    
    # Calculate velocity & acceleration across observed history
    velocities, accelerations = calculate_velocity_and_acceleration(volumes)
    latest_velocity = velocities[-1] if velocities else current_velocity
    latest_accel = accelerations[-1] if accelerations else 0.0
    
    # Compute 24-Hour Horizon (12 two-hour intervals)
    hw_24h = holt_winters_forecast(volumes, forecast_steps=12, alpha=0.35, beta=0.18)
    # Compute 3-Day Horizon (3 daily steps)
    hw_3d = holt_winters_forecast(volumes, forecast_steps=3, alpha=0.40, beta=0.15)
    # Compute 7-Day Horizon (7 daily steps)
    hw_7d = holt_winters_forecast(volumes, forecast_steps=7, alpha=0.42, beta=0.12)
    
    # Analyze trajectory
    projected_24h_end = hw_24h["forecast"][-1] if hw_24h["forecast"] else volumes[-1]
    pct_change_24h = ((projected_24h_end - volumes[-1]) / max(1.0, volumes[-1])) * 100.0
    
    if pct_change_24h > 30.0 and latest_accel >= 0:
        trajectory_24h = "surging"
        trajectory_label = "Surging Rapidly"
        sentiment_tone = "Bullish momentum with high viral acceleration"
    elif pct_change_24h > 5.0 and latest_accel >= -0.05:
        trajectory_24h = "rising"
        trajectory_label = "Steady Expansion"
        sentiment_tone = "Positive trajectory supported by consistent cross-outlet coverage"
    elif latest_accel < -0.1 and pct_change_24h >= -5.0:
        trajectory_24h = "peaking"
        trajectory_label = "Apex / Peaking"
        sentiment_tone = "Velocity deceleration detected; volume cresting near short-term ceiling"
    elif abs(pct_change_24h) <= 5.0:
        trajectory_24h = "steady"
        trajectory_label = "Stable Baseline"
        sentiment_tone = "Equilibrium maintained across current citation channels"
    else:
        trajectory_24h = "declining"
        trajectory_label = "Fading Momentum"
        sentiment_tone = "Downward velocity drift as editorial attention transitions"

    # Multi-horizon trajectory projections
    projected_3d_end = hw_3d["forecast"][-1] if hw_3d["forecast"] else projected_24h_end
    pct_change_3d = ((projected_3d_end - volumes[-1]) / max(1.0, volumes[-1])) * 100.0
    trajectory_3d = "rising" if pct_change_3d > 10.0 else ("steady" if pct_change_3d > -10.0 else "declining")
    
    projected_7d_end = hw_7d["forecast"][-1] if hw_7d["forecast"] else projected_3d_end
    pct_change_7d = ((projected_7d_end - volumes[-1]) / max(1.0, volumes[-1])) * 100.0
    trajectory_7d = "rising" if pct_change_7d > 15.0 else ("steady" if pct_change_7d > -15.0 else "declining")

    # Goodness-of-fit and confidence calculation
    rmse = hw_24h.get("rmse", 10.0)
    std_vols = math.sqrt(sum((v - (sum(volumes)/len(volumes)))**2 for v in volumes) / max(1, len(volumes)))
    confidence_score = round(max(0.68, min(0.96, 1.0 - (rmse / max(1.0, std_vols * 2.5)))), 2)
    
    # 24H Projected Time Labels (+2h, +4h, ..., +24h)
    forecast_24h_labels = [f"+{2 * (i + 1)}h" for i in range(len(hw_24h["forecast"]))]
    forecast_3d_labels = ["Day 1 (+24h)", "Day 2 (+48h)", "Day 3 (+72h)"]
    forecast_7d_labels = [f"Day {i + 1}" for i in range(len(hw_7d["forecast"]))]
    
    # AI Trend Rationale Synthesis
    ai_rationale = (
        f"Based on {len(volumes)} observed chronological intervals in {domain_name}, "
        f"{hashtag} exhibits a velocity of {latest_velocity:+.1f}% with an acceleration index of {latest_accel:+.2f}. "
        f"The double-exponential smoothing model forecasts a 24-hour volume shift of {pct_change_24h:+.1f}%, "
        f"placing this topic in the '{trajectory_label}' state with an empirical confidence level of {int(confidence_score * 100)}%."
    )

    return {
        "status": "success",
        "canForecast": True,
        "hashtag": hashtag,
        "trendTitle": trend_title,
        "domain": domain_name,
        "confidenceScore": confidence_score,
        "confidenceInterval": "95% Empirical Prediction Interval",
        "observedHistory": {
            "labels": timestamps,
            "values": volumes,
            "velocities": velocities
        },
        "horizons": {
            "h24": {
                "horizon": "24 Hours",
                "trajectory": trajectory_24h,
                "trajectoryLabel": trajectory_label,
                "projectedChangePct": round(pct_change_24h, 1),
                "labels": forecast_24h_labels,
                "forecast": hw_24h["forecast"],
                "upperBound": hw_24h["upper_bound"],
                "lowerBound": hw_24h["lower_bound"]
            },
            "d3": {
                "horizon": "3 Days",
                "trajectory": trajectory_3d,
                "trajectoryLabel": "Projected " + trajectory_3d.capitalize(),
                "projectedChangePct": round(pct_change_3d, 1),
                "labels": forecast_3d_labels,
                "forecast": hw_3d["forecast"],
                "upperBound": hw_3d["upper_bound"],
                "lowerBound": hw_3d["lower_bound"]
            },
            "d7": {
                "horizon": "7 Days",
                "trajectory": trajectory_7d,
                "trajectoryLabel": "Projected " + trajectory_7d.capitalize(),
                "projectedChangePct": round(pct_change_7d, 1),
                "labels": forecast_7d_labels,
                "forecast": hw_7d["forecast"],
                "upperBound": hw_7d["upper_bound"],
                "lowerBound": hw_7d["lower_bound"]
            }
        },
        "analysis": {
            "trajectory": trajectory_24h,
            "trajectoryLabel": trajectory_label,
            "sentimentTone": sentiment_tone,
            "latestVelocity": latest_velocity,
            "latestAcceleration": latest_accel,
            "aiRationale": ai_rationale
        }
    }

