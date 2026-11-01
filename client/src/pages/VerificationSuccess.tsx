import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export const VerificationSuccess: React.FC = () => (
  <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900">
    <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <div className="inline-flex items-center justify-center p-1 rounded-2xl ring-2 ring-slate-300 shadow-md mb-3 bg-[#F4F7FA]/90">
        <img src="/trendtide-logo.jpg" alt="TrendTide" className="w-16 h-16 rounded-xl object-cover" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight font-serif">Email verified</h1>
      <p className="mt-2 text-xs text-[#9D00FF] font-semibold uppercase tracking-wider font-mono">
        Your account is ready
      </p>
    </div>
    <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
      <div className="bg-[#F4F7FA]/95 backdrop-blur-md border border-slate-300 p-8 shadow-sm rounded-2xl text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Your email address has been verified. Sign in with your email and password to access TrendTide.
        </p>
        <Link
          to="/login"
          className="w-full h-11 inline-flex items-center justify-center bg-slate-900 hover:bg-[#9D00FF] text-white font-semibold text-xs rounded-xl transition"
        >
          Continue to sign in
        </Link>
      </div>
    </div>
  </div>
);
