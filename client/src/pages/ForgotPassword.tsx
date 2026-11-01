import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { requestPasswordReset } from '../api';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await requestPasswordReset(email.trim());
      if (response.success) {
        setSubmitted(true);
      } else {
        setError(response.error || 'Unable to process the request.');
      }
    } catch {
      setError('Unable to contact the password reset service. Please try again later.');
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
          Reset Password
        </h2>
        <p className="mt-1 text-xs text-[#9D00FF] font-semibold uppercase tracking-wider font-mono">
          TrendTide Account Recovery
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-[#F4F7FA] border border-slate-300 py-8 px-6 shadow-sm rounded-2xl sm:px-10 space-y-5">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Check your inbox</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If an account exists for <span className="text-[#9D00FF] font-semibold">{email}</span>, check your inbox for reset instructions. If nothing arrives, try again later. Links expire in 15 minutes.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full h-10 inline-flex items-center justify-center gap-2 bg-[#E2E7EE] hover:bg-[#D9DFE7] text-slate-700 font-semibold text-xs rounded-xl transition border border-slate-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
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
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your email address. If an account exists, we will send a secure password-reset link.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                <span>{isSubmitting ? 'Sending...' : 'Send reset link'}</span>
              </button>

              <div className="pt-3 border-t border-slate-200 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
