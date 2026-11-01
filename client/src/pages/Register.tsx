import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name.trim() || name.trim().length > 120) {
      setError('Enter your full name (up to 120 characters).');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
      setError('Password must be at least 8 characters and no more than 72 bytes.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(name, email.trim(), password, confirmPassword);
      if (res.success) {
        if (res.user) {
          navigate('/');
        } else {
          setSuccessMessage(
            res.message || 'Account created! Please check your email inbox to verify your account with Supabase, then log in.'
          );
        }
      } else {
        setError(res.error || 'Registration failed. Please check your information.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to contact registration server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 bg-transparent">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center p-1 rounded-2xl ring-2 ring-slate-300 shadow-md mb-3 bg-[#F4F7FA]/90 backdrop-blur-md">
          <img
            src="/trendtide-logo.jpg"
            alt="TrendTide Logo"
            className="w-16 h-16 rounded-xl object-cover"
          />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-serif">
          Create Account
        </h2>
        <p className="mt-1 text-xs text-[#9D00FF] font-semibold uppercase tracking-wider font-mono">
          Multi-Domain Live Trends & Forecasting Access
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-[#F4F7FA]/90 backdrop-blur-md border border-slate-300 py-8 px-6 shadow-sm rounded-2xl sm:px-10 space-y-5">
          
          {successMessage ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-sm text-emerald-950 block">Registration Complete</span>
                  <p className="text-emerald-800 leading-relaxed">{successMessage}</p>
                </div>
              </div>
              <Link
                to="/login"
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-xs text-xs font-bold text-white bg-slate-900 hover:bg-[#9D00FF] transition"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#FE1D01] shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#E2E7EE] border border-slate-300 text-sm text-slate-900 rounded-xl pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-[#9D00FF] focus:border-[#9D00FF] focus:bg-[#F0F3F7] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work or Personal Email
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#E2E7EE] border border-slate-300 text-sm text-slate-900 rounded-xl pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-[#9D00FF] focus:border-[#9D00FF] focus:bg-[#F0F3F7] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Register for TrendTide</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="text-center pt-1 text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#9D00FF] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
