'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ShieldCheck, Eye, EyeOff, Globe, TrendingUp, BarChart2, DollarSign, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import { authService } from '@/services/authService';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });

  const VALUE_PROPS = [
    { icon: Globe,      textKey: 'auth.valueProp1' },
    { icon: DollarSign, textKey: 'auth.valueProp2' },
    { icon: TrendingUp, textKey: 'auth.valueProp3' },
    { icon: BarChart2,  textKey: 'auth.valueProp4' },
  ] as const;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError(t('validation.passwordsDoNotMatch'));
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError(t('validation.passwordMinLength'));
      setIsLoading(false);
      return;
    }

    try {
      await authService.register(formData.name, formData.email, formData.password);
      await authService.login(formData.email, formData.password);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.registrationError'));
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/3" />
          </div>

          <div />

          <div className="relative z-10 space-y-8">
            <div>
              <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-3">
                {t('auth.globalAdPlatform')}
              </p>
              <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight">
                {t('auth.reachWorld')}
              </h2>
            </div>

            <ul className="space-y-4">
              {VALUE_PROPS.map(({ icon: Icon, textKey }) => (
                <li key={textKey} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/85 text-sm font-medium">{t(textKey)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/15">
            <p className="text-white/50 text-xs font-medium">
              {t('auth.alreadyHaveAccountPanel')}{' '}
              <Link href="/login" className="text-white font-bold hover:underline">
                {t('auth.signInArrow')}
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
                <h1 className="text-3xl font-black text-neutral-900 mb-1">{t('auth.registerTitle')}</h1>
                <p className="text-sm text-neutral-500">
                  {t('auth.registerSubtitle')}{' '}
                  <Link href="/login" className="font-bold hover:underline transition-all" style={{ color: '#790e61' }}>
                    {t('auth.signInLink')}
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
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    {t('auth.fullNameLabel')}
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#790e61] transition-colors" />
                    <input
                      id="name" name="name" type="text" autoComplete="name" required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 bg-white focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61] transition-all outline-none text-sm text-neutral-800 placeholder-neutral-400"
                      placeholder={t('auth.fullNamePlaceholder')}
                    />
                  </div>
                </div>

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
                      autoComplete="new-password" required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-neutral-200 bg-white focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61] transition-all outline-none text-sm text-neutral-800 placeholder-neutral-400"
                      placeholder={t('auth.createPasswordPlaceholder')}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-neutral-400">{t('auth.passwordHint')}</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    {t('auth.confirmPassword')}
                  </label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#790e61] transition-colors" />
                    <input
                      id="confirmPassword" name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password" required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-neutral-200 bg-white focus:ring-4 focus:ring-[#790e61]/10 focus:border-[#790e61] transition-all outline-none text-sm text-neutral-800 placeholder-neutral-400"
                      placeholder={t('auth.confirmPasswordPlaceholder')}
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
                  className="w-full py-3.5 text-white font-bold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #790e61, #c41e8a)',
                    boxShadow:  '0 4px 20px rgba(121, 14, 97, 0.35)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('auth.creatingAccount')}</span>
                    </>
                  ) : t('auth.createAccount')}
                </button>

                <p className="text-center text-xs text-neutral-400 pt-1">
                  {t('auth.termsText')}{' '}
                  <Link href="/terms" className="font-bold hover:underline" style={{ color: '#790e61' }}>{t('auth.termsLink')}</Link>
                  {' '}{t('auth.andText')}{' '}
                  <Link href="/privacy" className="font-bold hover:underline" style={{ color: '#790e61' }}>{t('auth.privacyLink')}</Link>
                </p>
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
