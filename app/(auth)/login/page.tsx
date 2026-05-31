'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';
import { useI18n } from '@/lib/i18n-context';
import Footer from '@/components/Footer';

const BRAND_QUOTES = [
  { text: 'Your next customer is already browsing.', sub: 'Be there when they look.' },
  { text: 'Global reach. Local feel.', sub: 'Yubbox connects your listing to the world.' },
  { text: 'One listing. 150+ countries.', sub: 'Start reaching customers today.' },
];

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const quote = BRAND_QUOTES[0];

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
        const adminCheck = await fetch('/api/admin/check');
        if (adminCheck.ok) {
          const adminData = await adminCheck.json();
          router.push(adminData.isAdmin ? '/admin' : '/dashboard');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 flex-col lg:flex-row">

        {/* ── LEFT: Brand panel ─────────────────────────────────────────── */}
        <div
          className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #5a0049 0%, #790e61 45%, #c41e8a 100%)' }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
            <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-white/5" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/3" />
          </div>

          <div />

          {/* Quote block */}
          <div className="relative z-10 space-y-6">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <blockquote>
              <p className="text-3xl xl:text-4xl font-black text-white leading-tight mb-3">
                &ldquo;{quote.text}&rdquo;
              </p>
              <p className="text-white/60 text-sm font-medium">{quote.sub}</p>
            </blockquote>

            <div className="pt-4 border-t border-white/15">
              <p className="text-white/50 text-xs font-medium">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-white font-bold hover:underline">
                  Sign up free →
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom tagline */}
          <div className="relative z-10">
            <p className="text-white/40 text-xs font-medium">
              List your products &amp; services for global reach
            </p>
          </div>
        </div>

        {/* ── RIGHT: Form ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-gray-50/60 min-h-screen lg:min-h-0">

          {/* Mobile top bar */}
          <div className="lg:hidden w-full text-center py-2 px-4 text-white text-sm font-medium"
            style={{ backgroundColor: 'var(--primary-btn)' }}>
            List your products &amp; services for global reach
          </div>

          {/* Back link */}
          <div className="px-6 pt-5 pb-0">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-neutral-700 transition-colors group">
              <div className="w-7 h-7 rounded-full bg-white border border-neutral-200 flex items-center justify-center group-hover:shadow-sm transition-all">
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              {/* Mobile logo */}
              <div className="lg:hidden flex justify-center mb-6">
                <div className="p-3 bg-white rounded-full shadow-lg border border-neutral-100">
                  <Logo height={48} width={48} disableLink />
                </div>
              </div>

              <div className="mb-8">
                <h1 className="text-3xl font-black text-neutral-900 mb-1">Welcome back</h1>
                <p className="text-sm text-neutral-500">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="font-bold hover:underline transition-all" style={{ color: '#790e61' }}>
                    Sign up free
                  </Link>
                </p>
              </div>

              {/* Error */}
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
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#790e61] transition-colors" />
                    <input
                      id="email" name="email" type="email" autoComplete="email" required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 bg-white focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61] transition-all outline-none text-sm text-neutral-800 placeholder-neutral-400"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-neutral-400">
                      Password
                    </label>
                    <a href="#" className="text-xs font-bold hover:underline" style={{ color: '#790e61' }}>
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#790e61] transition-colors" />
                    <input
                      id="password" name="password" type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password" required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-neutral-200 bg-white focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61] transition-all outline-none text-sm text-neutral-800 placeholder-neutral-400"
                      placeholder="Enter your password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me — custom styled */}
                <label htmlFor="remember" className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      id="remember" name="remember" type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-neutral-300 bg-white peer-checked:border-[#790e61] peer-checked:bg-[#790e61] transition-all flex items-center justify-center">
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm text-neutral-600 font-medium select-none">Remember me</span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 text-white font-bold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #790e61, #c41e8a)',
                    boxShadow: '0 4px 20px rgba(121, 14, 97, 0.35)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          <div className="px-6 pb-6">
            <Footer variant="simple" />
          </div>
        </div>
      </div>
    </div>
  );
}
