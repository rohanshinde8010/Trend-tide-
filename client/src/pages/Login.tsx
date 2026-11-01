import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to connect to authentication server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 bg-transparent">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        {/* TrendTide Official Emblem Logo */}
        <div className="inline-flex items-center justify-center p-1 rounded-2xl ring-2 ring-slate-300 shadow-md mb-3 bg-[#F4F7FA]/90 backdrop-blur-md">
          <img
            src="/trendtide-logo.jpg"
            alt="TrendTide Logo"
            className="w-16 h-16 rounded-xl object-cover"
          />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-serif">
          TrendTide
        </h2>
        <p className="mt-1 text-xs text-[#9D00FF] font-semibold uppercase tracking-wider font-mono">
          Multi-Domain Live Trends & AI Forecasting Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-[#F4F7FA]/90 backdrop-blur-md border border-slate-300 py-8 px-6 shadow-sm rounded-2xl sm:px-10 space-y-5">
          
          <div className="bg-slate-100 border border-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#9D00FF] shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">Secure Sign-In</span>
              <span className="text-[11px] text-slate-600">
                Sign in with your verified credentials. Sessions are securely authenticated via Supabase.
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FE1D01] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#E2E7EE] border border-slate-300 text-sm text-slate-900 rounded-xl pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-[#9D00FF] focus:border-[#9D00FF] focus:bg-[#F0F3F7] focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-[#9D00FF] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#E2E7EE] border border-slate-300 text-sm text-slate-900 rounded-xl pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-[#9D00FF] focus:border-[#9D00FF] focus:bg-[#F0F3F7] focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-xs text-xs font-bold text-white bg-slate-900 hover:bg-[#9D00FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9D00FF] transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Executive Desk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-1 text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#9D00FF] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
