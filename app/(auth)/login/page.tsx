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

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [remember,     setRemember]     = useState(false);
  const [formData,     setFormData]     = useState({ email: '', password: '' });

  const STATS = [
    { value: '150+', labelKey: 'auth.countriesReached' },
    { value: '$1',   labelKey: 'auth.perListing' },
    { value: '14',   labelKey: 'auth.daysActive' },
  ] as const;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        email:    formData.email,
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
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
            <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-white/5" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/[0.03]" />
          </div>

          <div />

          <div className="relative z-10 space-y-6">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <blockquote>
              <p className="text-3xl xl:text-4xl font-black text-white leading-tight mb-3">
                &ldquo;{t('auth.brandQuote')}&rdquo;
              </p>
              <p className="text-white/60 text-sm font-medium">{t('auth.brandQuoteSub')}</p>
            </blockquote>

            <div className="flex gap-6 pt-2">
              {STATS.map(({ value, labelKey }) => (
                <div key={labelKey}>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-white/50 text-xs font-medium">{t(labelKey)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/15">
            <p className="text-white/50 text-xs font-medium">
              {t('auth.dontHaveAccountPanel')}{' '}
              <Link href="/register" className="text-white font-bold hover:underline">
                {t('auth.dontHaveAccountArrow')}
              </Link>
            </p>
          </div>
        </div>

        {/* ── RIGHT: Form ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-gray-50/60 min-h-screen lg:min-h-0">

          <div className="lg:hidden w-full text-center py-2 px-4 text-white text-sm font-medium"
            style={{ backgroundColor: 'var(--primary-btn)' }}>
            {t('auth.mobileTopBar')}
          </div>

          <div className="px-6 pt-5 pb-0">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-neutral-700 transition-colors group">
              <div className="w-7 h-7 rounded-full bg-white border border-neutral-200 flex items-center justify-center group-hover:shadow-sm transition-all">
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
              <span>{t('auth.backToHome')}</span>
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              <div className="flex justify-center mb-7">
                <Logo height={72} width={72} disableLink />
              </div>

              <div className="mb-8 text-center">
                <h1 className="text-3xl font-black text-neutral-900 mb-1">{t('auth.loginTitle')}</h1>
                <p className="text-sm text-neutral-500">
                  {t('auth.loginSubtitle')}{' '}
                  <Link href="/register" className="font-bold hover:underline transition-all" style={{ color: '#790e61' }}>
                    {t('auth.signUpFreeLink')}
                  </Link>
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
                    {t('auth.emailLabel')}
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

                <div>
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    {t('auth.password')}
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#790e61] transition-colors" />
                    <input
                      id="password" name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password" required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-neutral-200 bg-white focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61] transition-all outline-none text-sm text-neutral-800 placeholder-neutral-400"
                      placeholder={t('auth.enterPasswordPlaceholder')}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setRemember(r => !r)}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      remember
                        ? 'border-[#790e61] bg-[#790e61]'
                        : 'border-neutral-300 bg-white'
                    }`}>
                      {remember && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-neutral-600 font-medium">{t('auth.rememberMe')}</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm font-medium hover:underline transition-colors" style={{ color: '#790e61' }}>
                    {t('auth.forgotPassword')}
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 text-white font-bold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-lg"
                  style={{
                    background:   'linear-gradient(135deg, #790e61, #c41e8a)',
                    boxShadow:    '0 4px 20px rgba(121, 14, 97, 0.35)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('auth.signingIn')}</span>
                    </>
                  ) : t('auth.signIn')}
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
