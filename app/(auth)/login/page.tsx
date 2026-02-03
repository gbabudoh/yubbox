'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import Logo from '@/components/Logo';
import { useI18n } from '@/lib/i18n-context';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Check if admin and redirect accordingly
        const adminCheck = await fetch('/api/admin/check');
        if (adminCheck.ok) {
          const adminData = await adminCheck.json();
          if (adminData.isAdmin) {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('errors.loginError')
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col relative overflow-y-auto">
      {/* Top Slogan */}
      <div className="w-full text-center py-2 px-4 shadow-sm z-20" style={{ backgroundColor: 'var(--primary-btn)' }}>
        <h1 className="text-white font-medium text-sm md:text-base tracking-wide">
          yubbox your product and services for global presence
        </h1>
      </div>

      {/* Nav Section (Back Button) */}
      <div className="w-full px-6 py-4 flex items-center z-20">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          </div>
          <span className="font-medium hidden sm:block">Back to Home</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 -mt-10">
        <div className="max-w-md w-full my-8">
        {/* Card Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-full shadow-lg border border-neutral-100">
                <Logo height={60} width={60} disableLink />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 to-neutral-600 mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-neutral-500 font-medium">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-[#790e61] hover:text-[#5a0149] font-bold hover:underline transition-all"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-2xl flex items-start gap-3"
              >
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </motion.div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-[#790e61] transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-neutral-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61] transition-all outline-none text-neutral-800 placeholder-neutral-400 font-medium"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 ml-1">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Password
                  </label>
                  <a href="#" className="text-xs text-[#790e61] hover:text-[#5a0149] font-bold hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-[#790e61] transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-neutral-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61] transition-all outline-none text-neutral-800 placeholder-neutral-400 font-medium"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center ml-1">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-[#790e61] focus:ring-[#790e61] border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-neutral-600 font-medium cursor-pointer select-none">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 bg-[#790e61] hover:bg-[#5a0149] text-white font-bold text-lg rounded-2xl shadow-xl shadow-[#790e61]/20 hover:shadow-[#790e61]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </motion.div>

        <p className="mt-6 text-center text-xs text-gray-400">
          © 2024 Yubbox. All rights reserved.
        </p>
        </div>
      </div>
    </div>
  );
}

