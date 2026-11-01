import React, { useState } from 'react';
import { useBackground } from '../context/BackgroundContext';

export const Settings: React.FC = () => {
  const [velocityAlertThreshold, setVelocityAlertThreshold] = useState(70);
  const [holtWintersAlpha, setHoltWintersAlpha] = useState(0.4);
  const [holtWintersBeta, setHoltWintersBeta] = useState(0.2);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const { bgStyle, setBgStyle, bgOpacity, setBgOpacity, options: bgOptions } = useBackground();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col w-full gap-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px] text-[#9D00FF]">tune</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Calibration</h1>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Configure notification thresholds, Holt-Winters smoothing hyperparameters, and research profile.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono px-4 py-3 rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          <span>Hyperparameters successfully synced with Python Time-Series Engine (Port 5001).</span>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* User Profile */}
        <div className="bg-[#F4F7FA] rounded-2xl p-6 shadow-2xs border border-slate-300 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="material-symbols-outlined text-[20px] text-[#9D00FF]">person</span>
            <h2 className="text-sm font-bold text-slate-900">Researcher / Analyst Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-600 mb-1.5 font-medium">Lead Researcher</label>
              <input
                type="text"
                defaultValue="Piyush (Lead Quantitative Analyst)"
                className="w-full bg-[#E2E7EE] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-[#9D00FF] focus:bg-[#F0F3F7] text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1.5 font-medium">Workspace Tenant</label>
              <input
                type="text"
                defaultValue="trendtide.internal"
                className="w-full bg-[#E2E7EE] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-[#9D00FF] focus:bg-[#F0F3F7] text-xs"
              />
            </div>
          </div>
        </div>

        {/* Mathematical Parameters */}
        <div className="bg-[#F4F7FA] rounded-2xl p-6 shadow-2xs border border-slate-300 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="material-symbols-outlined text-[20px] text-[#0284C7]">insights</span>
            <h2 className="text-sm font-bold text-slate-900">Holt-Winters Forecasting Hyperparameters</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Alpha (&alpha;) - Level Smoothing Factor</span>
                <span className="font-mono text-[#9D00FF] font-bold">{holtWintersAlpha}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.05"
                value={holtWintersAlpha}
                onChange={(e) => setHoltWintersAlpha(Number(e.target.value))}
                className="w-full accent-[#9D00FF] cursor-pointer"
              />
              <span className="text-[11px] text-slate-500">Determines the weight given to recent historical volume vs older observations.</span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Beta (&beta;) - Trend Smoothing Factor</span>
                <span className="font-mono text-[#0284C7] font-bold">{holtWintersBeta}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.05"
                value={holtWintersBeta}
                onChange={(e) => setHoltWintersBeta(Number(e.target.value))}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
              <span className="text-[11px] text-slate-500">Controls the rate at which linear trend acceleration updates across horizons.</span>
            </div>
          </div>
        </div>

        {/* Telemetry Alert Thresholds */}
        <div className="bg-[#F4F7FA] rounded-2xl p-6 shadow-2xs border border-slate-300 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="material-symbols-outlined text-[20px] text-[#FE1D01]">notifications_active</span>
            <h2 className="text-sm font-bold text-slate-900">Surge Alert Sensitivity</h2>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Global Surge Velocity Trigger</span>
              <span className="font-mono text-[#FE1D01] font-bold">+{velocityAlertThreshold}% / hr</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              step="5"
              value={velocityAlertThreshold}
              onChange={(e) => setVelocityAlertThreshold(Number(e.target.value))}
              className="w-full accent-[#FE1D01] cursor-pointer"
            />
            <span className="text-[11px] text-slate-500">Highlights trends and sends immediate notifications when growth exceeds this threshold.</span>
          </div>
        </div>

        {/* Web Background Canvas Configuration */}
        <div className="bg-[#F4F7FA]/90 backdrop-blur-md rounded-2xl p-6 shadow-2xs border border-slate-300 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#00E1FF]">palette</span>
              <h2 className="text-sm font-bold text-slate-900">Web Background Theme & Flow</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Active: {bgStyle}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bgOptions.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setBgStyle(opt.id)}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
                  bgStyle === opt.id
                    ? 'bg-[#E2E7EE] border-[#9D00FF] shadow-xs'
                    : 'bg-[#F4F7FA] border-slate-300 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{opt.icon}</span>
                  {bgStyle === opt.id && (
                    <span className="material-symbols-outlined text-sm text-[#9D00FF]">check_circle</span>
                  )}
                </div>
                <div className="font-semibold text-xs text-slate-900">{opt.name}</div>
                <div className="text-[10px] text-slate-500 leading-tight">{opt.desc}</div>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 font-semibold">Background Visibility & Depth</span>
              <span className="font-bold text-[#9D00FF]">{Math.round(bgOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={bgOpacity}
              onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
              className="w-full accent-[#9D00FF] cursor-pointer"
            />
            <span className="text-[11px] text-slate-500">
              Dynamically controls the prominence of topographic wave contours and telemetry coordinate grid overlays across the entire workspace.
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="h-10 px-5 bg-slate-900 hover:bg-[#9D00FF] text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            Save Calibration Settings
          </button>
        </div>
      </form>
    </div>
  );
};
