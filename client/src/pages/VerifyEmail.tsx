import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, MailCheck } from 'lucide-react';
import { verifyEmail } from '../api';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await verifyEmail(
        token
          ? { token }
          : { email, code: otp }
      );
      if (response.success) {
        navigate('/verification-success', { replace: true });
      } else {
        setError(response.error || 'This verification code or link is invalid or expired.');
      }
    } catch {
      setError('Unable to verify right now. Check your connection and try again.');
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
        <h1 className="text-3xl font-extrabold tracking-tight font-serif">Verify your email</h1>
        <p className="mt-2 text-xs text-[#9D00FF] font-semibold uppercase tracking-wider font-mono">
          Activate your TrendTide account
        </p>
      </div>
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#F4F7FA]/95 backdrop-blur-md border border-slate-300 p-8 shadow-sm rounded-2xl space-y-5">
          {token ? (
            <>
              <div className="w-12 h-12 mx-auto rounded-full bg-violet-50 text-[#9D00FF] border border-violet-200 flex items-center justify-center">
                <MailCheck className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-600 text-center leading-relaxed">
                Enter the 6-digit code sent to your email to confirm your address. It expires in 15 minutes.
              </p>
              {error && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleVerify}
                disabled={isSubmitting}
                className="w-full h-11 bg-slate-900 hover:bg-[#9D00FF] disabled:opacity-60 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isSubmitting ? 'Verifying...' : 'Confirm Email Address'}
              </button>
              <p className="text-center text-xs text-slate-500">
                Need a fresh code?{' '}
                <Link to={`/resend-verification${email ? `?email=${encodeURIComponent(email)}` : ''}`} className="font-semibold text-[#9D00FF] hover:underline">
                  Request a new one
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <MailCheck className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-center">Check your inbox</h2>
              <p className="text-sm text-slate-600 text-center leading-relaxed">
                {email ? <>We sent a 6-digit code to <strong>{email}</strong>.</> : 'We sent a verification code to the email address you registered.'}
                {' '}Enter it below to confirm your address. The code expires in 15 minutes.
              </p>

              {error && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full bg-[#E2E7EE] border border-slate-300 text-sm text-slate-900 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-[#9D00FF] focus:border-[#9D00FF] focus:bg-[#F0F3F7] focus:outline-none transition text-center tracking-[0.35em]"
                />
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isSubmitting || otp.length !== 6}
                  className="w-full h-11 bg-[#9D00FF] hover:bg-[#8600DB] disabled:opacity-60 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isSubmitting ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  to={`/resend-verification${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                  className="w-full h-11 inline-flex items-center justify-center bg-slate-900 hover:bg-[#9D00FF] text-white font-semibold text-xs rounded-xl transition"
                >
                  Resend verification email
                </Link>
                <Link to="/login" className="block text-center text-xs text-slate-600 hover:text-slate-900 font-semibold">
                  Return to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
