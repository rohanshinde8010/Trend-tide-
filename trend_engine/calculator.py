"""
TrendTide - Trend Engine & Forecasting Calculator
Implements Holt-Winters exponential smoothing, moving averages, velocity (dY/dt), and confidence bounds.
"""
import math
from typing import List, Dict, Any, Tuple

def calculate_moving_average(series: List[float], window: int = 5) -> List[float]:
    """Computes simple moving average over a given window."""
    if not series:
        return []
    ma = []
    for i in range(len(series)):
        start_idx = max(0, i - window + 1)
        sub = series[start_idx : i + 1]
        ma.append(round(sum(sub) / len(sub), 2))
    return ma

def calculate_velocity_and_acceleration(series: List[float], time_step: float = 1.0) -> Tuple[List[float], List[float]]:
    """
    Computes first derivative (velocity = dY/dt) and second derivative (acceleration = d2Y/dt2).
    """
    if len(series) < 2:
        return [0.0] * len(series), [0.0] * len(series)
    
    velocity = [0.0]
    for i in range(1, len(series)):
        v = (series[i] - series[i - 1]) / time_step
        velocity.append(round(v, 3))
        
    acceleration = [0.0]
    for i in range(1, len(velocity)):
        a = (velocity[i] - velocity[i - 1]) / time_step
        acceleration.append(round(a, 3))
        
    return velocity, acceleration

def holt_winters_forecast(
    series: List[float], 
    forecast_steps: int = 7, 
    alpha: float = 0.4, 
    beta: float = 0.2
) -> Dict[str, Any]:
    """
    Double exponential smoothing (Holt's Linear Trend Model) for trend forecasting with 95% uncertainty cone.
    """
    if len(series) < 2:
        return {
            "forecast": [],
            "upper_bound": [],
            "lower_bound": [],
            "rmse": 0.0
        }
        
    # Initialization
    level = series[0]
    trend = series[1] - series[0]
    fitted = [level]
    
    for i in range(1, len(series)):
        val = series[i]
        last_level = level
        level = alpha * val + (1 - alpha) * (last_level + trend)
        trend = beta * (level - last_level) + (1 - beta) * trend
        fitted.append(level)
        
    # Residual variance for uncertainty estimation
    errors = [(series[i] - fitted[i]) ** 2 for i in range(len(series))]
    mse = sum(errors) / max(1, len(errors))
    std_err = math.sqrt(mse)
    
    forecast = []
    upper_bound = []
    lower_bound = []
    
    # 95% confidence interval z = 1.96
    z = 1.96
    for h in range(1, forecast_steps + 1):
        pred = level + h * trend
        # Uncertainty widens with step horizon h
        horizon_std = std_err * math.sqrt(1 + (h - 1) * 0.15)
        forecast.append(round(pred, 2))
        upper_bound.append(round(pred + z * horizon_std, 2))
        lower_bound.append(round(max(0, pred - z * horizon_std), 2))
        
    return {
        "fitted": [round(x, 2) for x in fitted],
        "forecast": forecast,
        "upper_bound": upper_bound,
        "lower_bound": lower_bound,
        "rmse": round(std_err, 3),
        "final_velocity": round(trend, 3)
    }

