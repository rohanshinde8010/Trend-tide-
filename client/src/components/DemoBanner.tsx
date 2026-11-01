import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border-b border-amber-200/40 text-amber-900 px-4 py-2 text-xs flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          SIMULATED DATA (PHASE 1)
        </span>
        <span className="text-slate-700 hidden sm:inline">
          All observation counts, velocity curves, and forecasts are synthetic fixtures for interactive UI demonstration.
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition cursor-help text-[11px]">
        <HelpCircle className="w-3.5 h-3.5" />
        <span>No live ML/backend connected</span>
      </div>
    </div>
  );
};
