'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle } from 'lucide-react';
import Logo from '@/components/Logo';

function ResetPasswordForm() {
  const searchParams   = useSearchParams();
  const router         = useRouter();
  const token          = searchParams.get('token') ?? '';

  const [password,     setPassword]     = useState('');
  const [confirm,      setConfirm]      = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [done,         setDone]         = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  if (!token) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center shadow-sm"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <p className="text-red-500 font-medium mb-4">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="font-bold hover:underline" style={{ color: '#790e61' }}>
          Request a new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return; }

    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Something went wrong. Please try again.');
      } else {
        setDone(true);
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
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
        <h2 className="text-2xl font-black text-neutral-900 mb-2">Password updated!</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Your password has been changed. Redirecting you to sign in…
        </p>
        <Link href="/login" className="font-bold hover:underline text-sm" style={{ color: '#790e61' }}>
          Go to Sign In
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-8 shadow-sm"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

      <div className="mb-7 text-center">
        <h1 className="text-3xl font-black text-neutral-900 mb-1">Set new password</h1>
        <p className="text-sm text-neutral-500">Must be at least 6 characters.</p>
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
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
            New Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#790e61] transition-colors" />
            <input
              id="password" type={showPw ? 'text' : 'password'} required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-11 py-3 rounded-xl border border-neutral-200 bg-white focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61] transition-all outline-none text-sm text-neutral-800 placeholder-neutral-400"
              placeholder="Enter new password"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm" className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
            Confirm Password
          </label>
          <div className="relative group">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#790e61] transition-colors" />
            <input
              id="confirm" type={showConfirm ? 'text' : 'password'} required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full pl-11 pr-11 py-3 rounded-xl border border-neutral-200 bg-white focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61] transition-all outline-none text-sm text-neutral-800 placeholder-neutral-400"
              placeholder="Confirm new password"
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 text-white font-bold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #790e61, #c41e8a)',
            boxShadow:  '0 4px 20px rgba(121, 14, 97, 0.35)',
          }}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Updating…</span>
            </>
          ) : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col">
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
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
