'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import { useI18n } from '@/lib/i18n-context';

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email,     setEmail]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Something went wrong. Please try again.');
      } else {
        setSent(true);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col">

      {/* Back link */}
      <div className="px-6 pt-6">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-neutral-700 transition-colors group">
          <div className="w-7 h-7 rounded-full bg-white border border-neutral-200 flex items-center justify-center group-hover:shadow-sm transition-all">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          <span>{t('auth.backToHome') ?? 'Back to Sign In'}</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-7">
            <Logo height={72} width={72} disableLink />
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-neutral-100 p-8 text-center shadow-sm"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(121,14,97,0.08)' }}>
                <CheckCircle className="w-8 h-8" style={{ color: '#790e61' }} />
              </div>
              <h2 className="text-2xl font-black text-neutral-900 mb-2">Check your email</h2>
              <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                We sent a password reset link to <strong className="text-neutral-700">{email}</strong>.
                The link expires in 1 hour.
              </p>
              <p className="text-xs text-neutral-400">
                Didn&apos;t receive it?{' '}
                <button
                  type="button"
                  onClick={() => { setSent(false); setError(null); }}
                  className="font-bold hover:underline"
                  style={{ color: '#790e61' }}
                >
                  Try again
                </button>
              </p>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-100 p-8 shadow-sm"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

              <div className="mb-7 text-center">
                <h1 className="text-3xl font-black text-neutral-900 mb-1">Forgot password?</h1>
                <p className="text-sm text-neutral-500">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3"
                >
                  <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    {t('auth.emailLabel') ?? 'Email Address'}
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#790e61] transition-colors" />
                    <input
                      id="email" type="email" required autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 bg-white focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61] transition-all outline-none text-sm text-neutral-800 placeholder-neutral-400"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 text-white font-bold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  style={{
                    background:  'linear-gradient(135deg, #790e61, #c41e8a)',
                    boxShadow:   '0 4px 20px rgba(121, 14, 97, 0.35)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : 'Send Reset Link'}
                </button>

                <p className="text-center text-sm text-neutral-400 pt-1">
                  Remember your password?{' '}
                  <Link href="/login" className="font-bold hover:underline" style={{ color: '#790e61' }}>
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
