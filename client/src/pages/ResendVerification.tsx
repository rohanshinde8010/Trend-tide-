import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { resendVerificationEmail } from '../api';

export const ResendVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await resendVerificationEmail(email.trim());
      if (response.success) {
        setSubmitted(true);
      } else {
        setError(response.error || 'Unable to send a verification code.');
      }
    } catch {
      setError('Unable to contact the email service. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-1 rounded-2xl ring-2 ring-slate-300 shadow-md mb-3 bg-[#F4F7FA]/90">
          <img src="/trendtide-logo.jpg" alt="TrendTide" className="w-16 h-16 rounded-xl object-cover" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight font-serif">Resend verification</h1>
        <p className="mt-2 text-xs text-[#9D00FF] font-semibold uppercase tracking-wider font-mono">
          Email account verification
        </p>
      </div>
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#F4F7FA]/95 backdrop-blur-md border border-slate-300 p-8 shadow-sm rounded-2xl space-y-5">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold">Check your inbox</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                If an unverified account exists for that address, a new 6-digit code will arrive shortly. Codes expire in 15 minutes.
              </p>
              <Link to="/login" className="inline-block text-xs font-semibold text-[#9D00FF] hover:underline">
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Enter the email address you used to register. If the account needs verification, we will send a fresh 6-digit code.
              </p>
              {error && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label htmlFor="resend-email" className="block text-xs font-semibold text-slate-700 mb-1">Email address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="resend-email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-[#E2E7EE] border border-slate-300 text-sm text-slate-900 rounded-xl pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-[#9D00FF] focus:border-[#9D00FF] focus:outline-none transition"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-slate-900 hover:bg-[#9D00FF] disabled:opacity-60 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'Sending...' : 'Send verification code'}
              </button>
              <Link to="/login" className="block text-center text-xs text-slate-600 hover:text-slate-900 font-semibold">
                Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
