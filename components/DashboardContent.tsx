'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Layout,
  CheckCircle,
  Eye,
  MousePointerClick,
  CreditCard,
  TrendingUp,
  Plus,
  LogOut,
  Globe,
  ArrowUpRight,
  Package,
  Mail,
} from 'lucide-react';
import DashboardAdCard from './DashboardAdCard';
import Logo from './Logo';
import AdminLink from './admin/AdminLink';
import LanguageSwitcher from './LanguageSwitcher';
import { useI18n } from '@/lib/i18n-context';
import { IAd } from '@/types/models';
import { adService } from '@/services/adService';
import { analyticsService } from '@/services/analyticsService';

const BRAND = '#790e61';
const BRAND_GRAD = 'linear-gradient(135deg, #790e61, #c41e8a)';

const DashboardContent: React.FC = () => {
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const router = useRouter();
  const [ads, setAds] = useState<IAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAds: 0,
    activeAds: 0,
    expiredAds: 0,
    unpaidAds: 0,
    totalViews: 0,
    totalClicks: 0,
    totalRevenue: 0,
  });

  const fetchUserAds = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setIsLoading(true);
      const userAds = await adService.getUserAds(session.user.id);
      setAds(userAds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your ads');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const checkAdminAndRedirect = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/check');
      if (response.ok) {
        const data = await response.json();
        if (data.isAdmin) { router.push('/admin'); return; }
      }
      fetchUserAds();
    } catch {
      fetchUserAds();
    }
  }, [router, fetchUserAds]);

  const calculateStats = useCallback(async () => {
    const now = new Date();
    let totalViews = 0;
    let totalClicks = 0;

    const activeAds  = ads.filter(ad => ad.isPaid && ad.isActive && ad.expiryDate && new Date(ad.expiryDate) >= now);
    const expiredAds = ads.filter(ad => ad.expiryDate && new Date(ad.expiryDate) < now);
    const unpaidAds  = ads.filter(ad => !ad.isPaid);

    try {
      const results = await Promise.all(ads.map(ad => analyticsService.getAnalytics(ad.id).catch(() => null)));
      results.forEach(a => {
        if (a?.statistics) {
          totalViews  += a.statistics.totalViews  || 0;
          totalClicks += a.statistics.totalClicks || 0;
        }
      });
    } catch (e) { console.error('Failed to fetch analytics:', e); }

    setStats({
      totalAds: ads.length,
      activeAds: activeAds.length,
      expiredAds: expiredAds.length,
      unpaidAds: unpaidAds.length,
      totalViews,
      totalClicks,
      totalRevenue: ads.filter(ad => ad.isPaid).length * 1.0,
    });
  }, [ads]);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && session?.user?.id) checkAdminAndRedirect();
  }, [status, session, router, checkAdminAndRedirect]);

  useEffect(() => { if (ads.length > 0) calculateStats(); }, [ads, calculateStats]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#790e61]/20 border-t-[#790e61] animate-spin mx-auto mb-4" />
          <p className="text-neutral-400 text-sm font-medium animate-pulse">{t('common.loading')}</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const clickThroughRate = stats.totalViews > 0
    ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(2)
    : '0.00';

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.45 } },
  };

  const glass = 'bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl';

  return (
    <div className="min-h-screen bg-[#fdf9fc] relative overflow-hidden font-sans">
      {/* Background blobs — brand toned */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#790e61]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#c41e8a]/6 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className={`mb-8 p-6 rounded-3xl ${glass} relative z-40`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            {/* Left: logo + user info */}
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <Logo height={56} width={56} showText={false} />
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-black text-neutral-900 tracking-tight mb-1.5">
                  Welcome back,{' '}
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: BRAND_GRAD }}>
                    {session?.user?.name}
                  </span>
                </h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                    style={{ background: 'rgba(121,14,97,0.07)', borderColor: 'rgba(121,14,97,0.15)', color: BRAND }}>
                    <Mail className="w-3.5 h-3.5" />
                    {session?.user?.email}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                    style={{ background: 'rgba(121,14,97,0.07)', borderColor: 'rgba(121,14,97,0.15)', color: BRAND }}>
                    <Globe className="w-3.5 h-3.5" />
                    {t('ad.myAds')}
                  </span>
                  <AdminLink />
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
              <div className="p-1.5 bg-neutral-100/60 rounded-2xl border border-neutral-200/50">
                <LanguageSwitcher />
              </div>

              <Link href="/ads/create">
                <button
                  className="rounded-xl px-5 py-2.5 font-bold text-sm text-white flex items-center gap-2 transition-all hover:opacity-90 active:scale-95 shadow-lg"
                  style={{ background: BRAND_GRAD, boxShadow: '0 4px 16px rgba(121,14,97,0.3)' }}
                >
                  <Plus className="w-4 h-4" />
                  {t('ad.createNewAd')}
                </button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2.5 bg-white border border-neutral-200 text-neutral-500 rounded-2xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3"
          >
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* ── Stats grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: t('ad.totalAds'),    value: stats.totalAds,                    icon: Package,          iconBg: 'rgba(121,14,97,0.08)',   iconColor: BRAND },
            { label: t('ad.activeAds'),   value: stats.activeAds,                   icon: CheckCircle,      iconBg: 'rgba(16,185,129,0.1)',    iconColor: '#059669' },
            { label: t('ad.totalViews'),  value: stats.totalViews.toLocaleString(), icon: Eye,              iconBg: 'rgba(121,14,97,0.08)',   iconColor: BRAND },
            { label: t('ad.totalClicks'), value: stats.totalClicks.toLocaleString(),icon: MousePointerClick, iconBg: 'rgba(245,158,11,0.1)',   iconColor: '#d97706', sub: `${clickThroughRate}% CTR` },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`p-5 rounded-3xl ${glass} relative overflow-hidden`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: stat.iconBg }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.iconColor }} />
                </div>
                {stat.sub && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                    {stat.sub}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-neutral-400 mb-0.5">{stat.label}</p>
              <p className="text-3xl font-black text-neutral-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Insight row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Ad Status */}
          <motion.div variants={itemVariants} className={`p-6 rounded-3xl ${glass}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(121,14,97,0.08)' }}>
                <Layout className="w-4 h-4" style={{ color: BRAND }} />
              </div>
              <h3 className="font-bold text-neutral-800">{t('ad.adStatus')}</h3>
            </div>
            <div className="space-y-5">
              {[
                { label: t('ad.expiredAds'), value: stats.expiredAds, barColor: '#f97316' },
                { label: t('ad.unpaidAds'),  value: stats.unpaidAds,  barColor: '#ef4444' },
              ].map((row) => (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 font-medium">{row.label}</span>
                    <span className="text-lg font-black" style={{ color: row.barColor }}>{row.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: stats.totalAds > 0 ? `${(row.value / stats.totalAds) * 100}%` : '0%' }}
                      className="h-full rounded-full"
                      style={{ background: row.barColor }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance */}
          <motion.div variants={itemVariants} className={`p-6 rounded-3xl ${glass}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(121,14,97,0.08)' }}>
                <TrendingUp className="w-4 h-4" style={{ color: BRAND }} />
              </div>
              <h3 className="font-bold text-neutral-800">{t('ad.performance')}</h3>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border" style={{ background: 'rgba(121,14,97,0.05)', borderColor: 'rgba(121,14,97,0.12)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: BRAND }}>{t('ad.clickThroughRate')}</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-neutral-900">{clickThroughRate}%</span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/50 border border-neutral-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">{t('ad.avgViewsPerAd')}</p>
                <span className="text-2xl font-black text-neutral-900">
                  {stats.totalAds > 0 ? Math.round(stats.totalViews / stats.totalAds) : 0}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Financial */}
          <motion.div variants={itemVariants} className={`p-6 rounded-3xl ${glass}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50">
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-neutral-800">{t('ad.revenue')}</h3>
            </div>
            <div className="space-y-3">
              <div className="p-5 bg-emerald-500 rounded-3xl text-white shadow-lg shadow-emerald-500/20">
                <p className="text-emerald-100 text-xs font-semibold mb-1">{t('ad.totalSpent')}</p>
                <p className="text-3xl font-black">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-sm text-neutral-500">{t('ad.avgCostPerAd')}</span>
                </div>
                <span className="font-bold text-neutral-900">
                  ${stats.totalAds > 0 ? (stats.totalRevenue / stats.totalAds).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Ad grid ─────────────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className={`rounded-4xl overflow-hidden ${glass} p-6 sm:p-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight mb-1">
                {t('ad.yourAds')}
              </h2>
              <p className="text-sm text-neutral-400 font-medium">Manage and monitor your global yubbox listings</p>
            </div>

            {ads.length > 0 && (
              <Link href="/ads/create">
                <button
                  className="rounded-xl px-4 py-2 text-sm font-bold border transition-all hover:opacity-90 flex items-center gap-2"
                  style={{ borderColor: 'rgba(121,14,97,0.25)', color: BRAND, background: 'rgba(121,14,97,0.05)' }}
                >
                  <Plus className="w-4 h-4" />
                  {t('ad.createNewAd')}
                </button>
              </Link>
            )}
          </div>

          <AnimatePresence mode="wait">
            {ads.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 px-6 text-center"
              >
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="mb-8 p-10 rounded-[3rem] relative"
                  style={{ background: 'rgba(121,14,97,0.07)' }}
                >
                  <Package className="w-16 h-16" style={{ color: BRAND }} />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white border-4 rounded-full flex items-center justify-center"
                    style={{ borderColor: 'rgba(121,14,97,0.2)' }}>
                    <div className="w-2 h-2 rounded-full animate-ping" style={{ background: BRAND }} />
                  </div>
                </motion.div>

                <h3 className="text-2xl font-black text-neutral-900 mb-2">No active yubbox yet</h3>
                <p className="text-neutral-400 text-sm font-medium max-w-sm mx-auto mb-8">
                  {t('ad.noAdsYet')}
                </p>

                <Link href="/ads/create">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg"
                    style={{ background: BRAND_GRAD, boxShadow: '0 4px 16px rgba(121,14,97,0.3)' }}
                  >
                    <Plus className="w-4 h-4" />
                    {t('home.createFirstAd')}
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {ads.map((ad, idx) => (
                  <motion.div
                    key={ad.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <DashboardAdCard ad={ad} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <div className="mt-16 py-8 text-center relative z-10 border-t border-neutral-100">
        <div className="flex items-center justify-center gap-2 mb-2 opacity-30">
          <Logo height={32} width={32} showText={false} />
          <span className="text-neutral-400 font-black tracking-widest text-xs">{t('common.footerTagline')}</span>
        </div>
        <p className="text-neutral-400 text-xs">{t('common.footerBranding')}</p>
      </div>
    </div>
  );
};

export default DashboardContent;
