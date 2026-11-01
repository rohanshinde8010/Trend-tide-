import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { resetPassword } from '../api';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
      setError('Password must be at least 8 characters and no more than 72 bytes.');
      return;
    }
    if (!token) {
      setError('This password reset link is invalid or missing. Request a new link.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await resetPassword(token, password, confirmPassword);
      if (response.success) {
        setSuccess(true);
        navigate('/reset-password', { replace: true });
      } else {
        setError(response.error || 'This password reset link is invalid or expired.');
      }
    } catch {
      setError('Unable to reset your password right now. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 bg-[#EAEFF4]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center p-1 rounded-2xl ring-2 ring-slate-300 shadow-md mb-3 bg-[#F4F7FA]">
          <img
            src="/trendtide-logo.jpg"
            alt="TrendTide Logo"
            className="w-16 h-16 rounded-xl object-cover"
          />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-serif">
          Create New Password
        </h2>
        <p className="mt-1 text-xs text-[#9D00FF] font-semibold uppercase tracking-wider font-mono">
          TrendTide Security Credentials
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-[#F4F7FA] border border-slate-300 py-8 px-6 shadow-sm rounded-2xl sm:px-10 space-y-5">
          {success ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Password Updated Successfully</h3>
              <p className="text-xs text-slate-600">
                Your password has been updated. Sign in with your new password to continue.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full h-11 inline-flex items-center justify-center gap-2 bg-[#9D00FF] hover:bg-[#8600DB] text-white font-semibold text-xs rounded-xl transition shadow-xs"
                >
                  <span>Go to Sign In Immediately</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {!token && (
                <Link to="/forgot-password" className="block text-xs font-semibold text-[#9D00FF] hover:underline">
                  Request a new password reset link
                </Link>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#E2E7EE] border border-slate-300 text-sm text-slate-900 rounded-xl pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-[#9D00FF] focus:border-[#9D00FF] focus:bg-[#F0F3F7] focus:outline-none transition"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">At least 8 characters (maximum 72 bytes)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#E2E7EE] border border-slate-300 text-sm text-slate-900 rounded-xl pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-[#9D00FF] focus:border-[#9D00FF] focus:bg-[#F0F3F7] focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-slate-900 hover:bg-[#9D00FF] disabled:opacity-60 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{isSubmitting ? 'Saving...' : 'Save new password'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
