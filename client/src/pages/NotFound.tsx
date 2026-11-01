import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-[#F4F7FA] border border-slate-300 rounded-2xl p-8 max-w-md w-full text-center shadow-sm space-y-4">
        <div className="w-14 h-14 bg-purple-50 text-[#9D00FF] rounded-2xl flex items-center justify-center mx-auto border border-purple-200">
          <FileQuestion className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-[#E2E7EE] px-2 py-0.5 rounded-full border border-slate-300">
            HTTP 404 Not Found
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Resource Not Located</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The topic, forecast series, or analytical partition requested does not exist or has been archived.
          </p>
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
            to="/explore"
            className="h-9 px-4 inline-flex items-center gap-1.5 bg-[#E2E7EE] hover:bg-[#D9DFE7] text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Explore Trends</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
