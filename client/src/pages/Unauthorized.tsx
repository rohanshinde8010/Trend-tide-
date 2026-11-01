import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, KeyRound } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-[#F4F7FA] border border-slate-300 rounded-2xl p-8 max-w-md w-full text-center shadow-sm space-y-4">
        <div className="w-14 h-14 bg-red-50 text-[#FE1D01] rounded-2xl flex items-center justify-center mx-auto border border-red-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FE1D01] bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            You do not possess the required permissions to modify analytical parameters or access this administrative partition.
          </p>
        </div>

        <div className="bg-[#E2E7EE] p-3 rounded-xl border border-slate-300 text-[11px] text-slate-600 text-left space-y-1">
          <p><strong>Required Role:</strong> Senior Analytics Architect</p>
          <p><strong>Current Session:</strong> Restricted Student Viewer</p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="h-9 px-4 inline-flex items-center gap-1.5 bg-[#9D00FF] hover:bg-[#8600DB] text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Live Feed</span>
          </Link>
          <Link
            to="/login"
            className="h-9 px-4 inline-flex items-center gap-1.5 bg-[#E2E7EE] hover:bg-[#D9DFE7] text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-300"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Switch Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
