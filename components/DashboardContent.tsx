'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, CheckCircle, Eye, MousePointerClick, CreditCard,
  TrendingUp, Plus, LogOut, Globe, ArrowUpRight, Mail,
  AlertTriangle, Bell, Zap, BarChart3, MapPin, Clock,
  Sparkles, ArrowRight, Heart, Target,
} from 'lucide-react';
import DashboardAdCard from './DashboardAdCard';
import IntelligencePanel from './IntelligencePanel';
import Logo from './Logo';
import LiveClock from './LiveClock';
import AdminLink from './admin/AdminLink';
import LanguageSwitcher from './LanguageSwitcher';
import { useI18n } from '@/lib/i18n-context';
import { IAd } from '@/types/models';
import { adService } from '@/services/adService';
import { analyticsService } from '@/services/analyticsService';
import { getCountryByCode } from '@/lib/countries';

const BRAND      = '#790e61';
const BRAND_GRAD = 'linear-gradient(135deg, #790e61, #c41e8a)';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AdStat {
  totalViews:   number;
  totalClicks:  number;
  countryStats: { country: string; count: number }[];
  dailyStats:   { date: string; count: number }[];
}

// ── Tiny SVG sparkline ────────────────────────────────────────────────────────
function Sparkline({ data, color = '#790e61', height = 32 }: { data: number[]; color?: string; height?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 80;
  const h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * w;
    const y = h - (v / max) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const DashboardContent: React.FC = () => {
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const router = useRouter();

  const [ads,         setAds]         = useState<IAd[]>([]);
  const [adStats,     setAdStats]     = useState<Map<string, AdStat>>(new Map());
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [activeTab,   setActiveTab]   = useState<'yubboxes' | 'analytics' | 'intelligence'>('yubboxes');

  const [overview, setOverview] = useState({
    totalAds: 0, activeAds: 0, expiredAds: 0, unpaidAds: 0,
    totalViews: 0, totalClicks: 0, totalYubboxes: 0,
    totalRevenue: 0, countriesReached: 0,
    viewsTrend: [] as number[],
    topCountries: [] as { country: string; count: number }[],
  });

  // ── Fetch ads ───────────────────────────────────────────────────────────────
  const fetchUserAds = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setIsLoading(true);
      const userAds = await adService.getUserAds(session.user.id);
      setAds(userAds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your Yubboxes');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const checkAdminAndRedirect = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/check');
      if (res.ok) {
        const d = await res.json();
        if (d.isAdmin) { router.push('/admin'); return; }
      }
      fetchUserAds();
    } catch { fetchUserAds(); }
  }, [router, fetchUserAds]);

  // ── Crunch analytics for all ads ────────────────────────────────────────────
  const buildOverview = useCallback(async () => {
    const now = new Date();
    const map = new Map<string, AdStat>();

    const results = await Promise.all(
      ads.map(ad => analyticsService.getAnalytics(ad.id).catch(() => null))
    );

    let totalViews = 0, totalClicks = 0;
    const countryMap = new Map<string, number>();
    const dailyMap   = new Map<string, number>();

    results.forEach((r, i) => {
      const ad = ads[i];
      const stat: AdStat = {
        totalViews:   r?.statistics?.totalViews  || 0,
        totalClicks:  r?.statistics?.totalClicks || 0,
        countryStats: r?.statistics?.countryStats || [],
        dailyStats:   r?.statistics?.dailyStats   || [],
      };
      map.set(ad.id, stat);
      totalViews  += stat.totalViews;
      totalClicks += stat.totalClicks;

      stat.countryStats.forEach(cs => {
        countryMap.set(cs.country, (countryMap.get(cs.country) || 0) + cs.count);
      });
      stat.dailyStats.forEach(ds => {
        dailyMap.set(ds.date, (dailyMap.get(ds.date) || 0) + ds.count);
      });
    });

    setAdStats(map);

    // Build 7-day view trend (last 7 days)
    const trend: number[] = [];
    for (let d = 6; d >= 0; d--) {
      const dt = new Date(now);
      dt.setDate(dt.getDate() - d);
      const key = dt.toISOString().slice(0, 10);
      trend.push(dailyMap.get(key) || 0);
    }

    const topCountries = [...countryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }));

    const activeAds  = ads.filter(a => a.isPaid && a.isActive && a.expiryDate && new Date(a.expiryDate) >= now);
    const expiredAds = ads.filter(a => a.expiryDate && new Date(a.expiryDate) < now);
    const unpaidAds  = ads.filter(a => !a.isPaid);

    setOverview({
      totalAds:        ads.length,
      activeAds:       activeAds.length,
      expiredAds:      expiredAds.length,
      unpaidAds:       unpaidAds.length,
      totalViews,
      totalClicks,
      totalYubboxes:   ads.reduce((s, a) => s + (a.yubboxCount || 0), 0),
      totalRevenue:    ads.filter(a => a.isPaid).length * 1.0,
      countriesReached: countryMap.size,
      viewsTrend:      trend,
      topCountries,
    });
  }, [ads]);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && session?.user?.id) checkAdminAndRedirect();
  }, [status, session, router, checkAdminAndRedirect]);

  useEffect(() => { if (ads.length > 0) buildOverview(); }, [ads, buildOverview]);

  // ── Guards ──────────────────────────────────────────────────────────────────
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

  // ── Derived values ──────────────────────────────────────────────────────────
  const now           = new Date();
  const ctr           = overview.totalViews > 0 ? ((overview.totalClicks / overview.totalViews) * 100).toFixed(1) : '0.0';
  const expiringSoon  = ads.filter(a => {
    if (!a.expiryDate || !a.isActive || !a.isPaid) return false;
    const days = (new Date(a.expiryDate).getTime() - now.getTime()) / 86400000;
    return days > 0 && days <= 3;
  });

  const glass = 'bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl';

  const statCards = [
    {
      label: t('dashboard.statTotalYubboxes'), value: overview.totalAds,
      icon: Package, iconBg: 'rgba(121,14,97,0.08)', iconColor: BRAND,
      sub: t('dashboard.subActive', { count: overview.activeAds }),
    },
    {
      label: t('dashboard.statTotalViews'), value: overview.totalViews.toLocaleString(),
      icon: Eye, iconBg: 'rgba(99,102,241,0.08)', iconColor: '#6366f1',
      trend: overview.viewsTrend,
    },
    {
      label: t('dashboard.statTotalClicks'), value: overview.totalClicks.toLocaleString(),
      icon: MousePointerClick, iconBg: 'rgba(245,158,11,0.08)', iconColor: '#d97706',
      sub: t('dashboard.subCtr', { value: ctr }),
    },
    {
      label: t('dashboard.statYubboxCount'), value: overview.totalYubboxes.toLocaleString(),
      icon: Heart, iconBg: 'rgba(239,68,68,0.08)', iconColor: '#ef4444',
      sub: t('dashboard.subEngagement'),
    },
    {
      label: t('dashboard.statCountriesReached'), value: overview.countriesReached,
      icon: Globe, iconBg: 'rgba(14,165,233,0.08)', iconColor: '#0ea5e9',
      sub: t('dashboard.subGlobalReach'),
    },
    {
      label: t('dashboard.statTotalSpent'), value: `$${overview.totalRevenue.toFixed(2)}`,
      icon: CreditCard, iconBg: 'rgba(16,185,129,0.08)', iconColor: '#059669',
      sub: t('dashboard.subAvg', { value: overview.totalAds > 0 ? (overview.totalRevenue / overview.totalAds).toFixed(2) : '0.00' }),
    },
  ];

  return (
    <div className="min-h-screen bg-[#fdf9fc] relative overflow-hidden font-sans">
      {/* Background glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#790e61]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#c41e8a]/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-3xl ${glass}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Logo + live clock — locked to this region */}
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border"
                style={{ background: 'rgba(121,14,97,0.04)', borderColor: 'rgba(121,14,97,0.12)' }}>
                <Logo height={40} width={40} showText={false} />
                <div className="w-px h-8 bg-neutral-200" />
                <LiveClock />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-0.5">{t('dashboard.title')}</p>
                <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                  {t('dashboard.welcomeBack')}{' '}
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: BRAND_GRAD }}>
                    {session?.user?.name}
                  </span>
                </h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border"
                    style={{ background: 'rgba(121,14,97,0.06)', borderColor: 'rgba(121,14,97,0.14)', color: BRAND }}>
                    <Mail className="w-3 h-3" />{session?.user?.email}
                  </span>
                  <AdminLink />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
              <div className="p-1.5 bg-neutral-100/60 rounded-2xl border border-neutral-200/50">
                <LanguageSwitcher />
              </div>
              <Link href="/ads/create">
                <button className="rounded-xl px-5 py-2.5 font-bold text-sm text-white flex items-center gap-2 transition-all hover:opacity-90 active:scale-95 shadow-lg"
                  style={{ background: BRAND_GRAD, boxShadow: '0 4px 16px rgba(121,14,97,0.3)' }}>
                  <Plus className="w-4 h-4" />
                  {t('dashboard.createYubbox')}
                </button>
              </Link>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2.5 bg-white border border-neutral-200 text-neutral-500 rounded-2xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Smart Alerts ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {(expiringSoon.length > 0 || overview.unpaidAds > 0) && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {expiringSoon.length > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-amber-900">
                      {t('dashboard.expiringSoon', { count: expiringSoon.length })}
                    </p>
                    <p className="text-xs text-amber-700 truncate">{t('dashboard.renewNow')}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />
                </div>
              )}
              {overview.unpaidAds > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-200 bg-red-50">
                  <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-red-900">
                      {t('dashboard.unpaidAlert', { count: overview.unpaidAds })}
                    </p>
                    <p className="text-xs text-red-700">{t('dashboard.activateNow')}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-red-400 shrink-0" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats grid ─────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={i} whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className={`p-5 rounded-3xl ${glass} flex flex-col gap-3 relative overflow-hidden`}>
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: s.iconBg }}>
                  <s.icon className="w-4 h-4" style={{ color: s.iconColor }} />
                </div>
                {s.trend && (
                  <Sparkline data={s.trend} color={s.iconColor as string} height={28} />
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-neutral-400 mb-0.5">{s.label}</p>
                <p className="text-2xl font-black text-neutral-900 leading-none">{s.value}</p>
                {s.sub && <p className="text-[10px] text-neutral-400 mt-0.5 font-medium">{s.sub}</p>}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">{error}</div>
        )}

        {/* ── Tab nav ────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100/80 rounded-2xl w-fit flex-wrap">
          {([
            { key: 'yubboxes',     label: `${t('dashboard.tabYubboxes')} (${ads.length})` },
            { key: 'analytics',    label: t('dashboard.tabAnalytics') },
            { key: 'intelligence', label: t('dashboard.tabIntelligence') },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === key
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
              style={activeTab === key && key === 'intelligence'
                ? { color: '#790e61' }
                : key === 'intelligence'
                  ? { color: 'rgba(121,14,97,0.5)' }
                  : {}}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab: My Yubboxes ───────────────────────────────────────────────── */}
        {activeTab === 'yubboxes' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Ad grid */}
            <div className="xl:col-span-2">
              <div className={`rounded-3xl ${glass} p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-black text-neutral-900">{t('dashboard.yourYubboxes')}</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">{t('dashboard.manageListings')}</p>
                  </div>
                  {ads.length > 0 && (
                    <Link href="/ads/create">
                      <button className="text-xs font-bold px-4 py-2 rounded-xl border flex items-center gap-1.5 transition-all hover:opacity-80"
                        style={{ borderColor: 'rgba(121,14,97,0.2)', color: BRAND, background: 'rgba(121,14,97,0.05)' }}>
                        <Plus className="w-3.5 h-3.5" />{t('dashboard.newYubbox')}
                      </button>
                    </Link>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {ads.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-16 text-center">
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="mb-6 p-8 rounded-[2rem]" style={{ background: 'rgba(121,14,97,0.06)' }}>
                        <Package className="w-12 h-12" style={{ color: BRAND }} />
                      </motion.div>
                      <h3 className="text-lg font-black text-neutral-900 mb-2">{t('dashboard.noYubboxes')}</h3>
                      <p className="text-neutral-400 text-sm mb-6 max-w-xs">{t('ad.noAdsYet')}</p>
                      <Link href="/ads/create">
                        <button className="px-6 py-3 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg"
                          style={{ background: BRAND_GRAD, boxShadow: '0 4px 16px rgba(121,14,97,0.3)' }}>
                          <Plus className="w-4 h-4" />{t('dashboard.createYubbox')}
                        </button>
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {ads.map((ad, i) => (
                        <motion.div key={ad.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}>
                          <DashboardAdCard ad={ad} analyticsData={adStats.get(ad.id)} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Analytics sidebar */}
            <div className="space-y-4">

              {/* Performance score */}
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                className={`p-6 rounded-3xl ${glass}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(121,14,97,0.08)' }}>
                    <TrendingUp className="w-4 h-4" style={{ color: BRAND }} />
                  </div>
                  <h3 className="font-bold text-neutral-800 text-sm">{t('dashboard.performanceOverview')}</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { label: t('dashboard.clickThroughRate'), value: `${ctr}%`, color: '#6366f1', icon: Target },
                    { label: t('dashboard.avgViewsPerYubbox'), value: overview.totalAds > 0 ? Math.round(overview.totalViews / overview.totalAds) : 0, color: BRAND, icon: Eye },
                    { label: t('dashboard.avgClicksPerYubbox'), value: overview.totalAds > 0 ? Math.round(overview.totalClicks / overview.totalAds) : 0, color: '#d97706', icon: MousePointerClick },
                  ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="flex items-center justify-between p-3 rounded-2xl bg-white/50 border border-neutral-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                          <Icon className="w-3.5 h-3.5" style={{ color }} />
                        </div>
                        <span className="text-xs text-neutral-500 font-medium">{label}</span>
                      </div>
                      <span className="text-sm font-black text-neutral-900">{value}</span>
                    </div>
                  ))}
                </div>

                {/* 7-day trend */}
                {overview.viewsTrend.some(v => v > 0) && (
                  <div className="mt-4 p-3 rounded-2xl" style={{ background: 'rgba(121,14,97,0.04)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: BRAND }}>
                      {t('dashboard.viewsTrend')}
                    </p>
                    <div className="flex items-end justify-between gap-1 h-12">
                      {overview.viewsTrend.map((v, i) => {
                        const maxV = Math.max(...overview.viewsTrend, 1);
                        const h = Math.max((v / maxV) * 100, 4);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full rounded-sm transition-all"
                              style={{ height: `${h}%`, background: BRAND_GRAD, opacity: 0.6 + (i / 7) * 0.4 }} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-neutral-400">{t('dashboard.daysAgo')}</span>
                      <span className="text-[9px] text-neutral-400">{t('dashboard.today')}</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Country reach */}
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.22 }}
                className={`p-6 rounded-3xl ${glass}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-sky-50">
                      <Globe className="w-4 h-4 text-sky-500" />
                    </div>
                    <h3 className="font-bold text-neutral-800 text-sm">{t('dashboard.topCountries')}</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-600">
                    {t('dashboard.totalCountries', { count: overview.countriesReached })}
                  </span>
                </div>

                {overview.topCountries.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <Globe className="w-8 h-8 text-neutral-200 mb-2" />
                    <p className="text-xs text-neutral-400">{t('dashboard.noCountryData')}</p>
                    <p className="text-[10px] text-neutral-300 mt-1">{t('dashboard.shareToTrack')}</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {overview.topCountries.map(({ country, count }, i) => {
                      const info = getCountryByCode(country);
                      const maxCount = overview.topCountries[0]?.count || 1;
                      const pct = Math.round((count / maxCount) * 100);
                      return (
                        <div key={country} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-base leading-none">{info?.flag || '🏳️'}</span>
                              <span className="text-xs font-semibold text-neutral-700 truncate max-w-[100px]">
                                {info?.name || country}
                              </span>
                            </div>
                            <span className="text-xs font-black text-neutral-900">{count}</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: i * 0.1, duration: 0.6 }}
                              className="h-full rounded-full"
                              style={{ background: BRAND_GRAD }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Upgrade prompt */}
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="p-6 rounded-3xl overflow-hidden relative"
                style={{ background: BRAND_GRAD }}>
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-black text-white text-sm mb-1">{t('dashboard.boostReach')}</h3>
                  <p className="text-white/70 text-xs mb-4 leading-relaxed">
                    {t('dashboard.boostDescription')}
                  </p>
                  <Link href="/ads/create">
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl text-xs font-bold transition-all hover:opacity-90"
                      style={{ color: BRAND }}>
                      <Zap className="w-3.5 h-3.5" />
                      {t('dashboard.upgradePlacement')}
                    </button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* ── Tab: Analytics ─────────────────────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Views vs Clicks */}
            <div className={`p-6 rounded-3xl ${glass}`}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                </div>
                <h3 className="font-bold text-neutral-800">{t('dashboard.viewsVsClicks')}</h3>
              </div>
              {ads.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-neutral-300 text-sm">{t('dashboard.noDataYet')}</div>
              ) : (
                <div className="space-y-3">
                  {ads.slice(0, 6).map(ad => {
                    const s = adStats.get(ad.id);
                    const views   = s?.totalViews || 0;
                    const clicks  = s?.totalClicks || 0;
                    const maxViews = Math.max(...ads.map(a => adStats.get(a.id)?.totalViews || 0), 1);
                    return (
                      <div key={ad.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-neutral-700 truncate max-w-[180px]">{ad.title}</p>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-neutral-400">
                            <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{views}</span>
                            <span className="flex items-center gap-0.5"><MousePointerClick className="w-3 h-3 text-amber-500" />{clicks}</span>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden flex">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${(views / maxViews) * 100}%` }}
                            className="h-full rounded-full" style={{ background: 'rgba(99,102,241,0.5)' }}
                          />
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${(clicks / maxViews) * 100}%` }}
                            className="h-full rounded-full" style={{ background: BRAND_GRAD }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-indigo-300 opacity-70" /><span className="text-[10px] text-neutral-400">{t('dashboard.colViews')}</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: BRAND }} /><span className="text-[10px] text-neutral-400">{t('dashboard.colClicks')}</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Per-Yubbox table */}
            <div className={`p-6 rounded-3xl ${glass}`}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(121,14,97,0.08)' }}>
                  <Target className="w-4 h-4" style={{ color: BRAND }} />
                </div>
                <h3 className="font-bold text-neutral-800">{t('dashboard.performanceTable')}</h3>
              </div>
              {ads.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-neutral-300 text-sm">{t('dashboard.noYubboxes')}</div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-5 px-2 pb-2 border-b border-neutral-100">
                    {[t('dashboard.colYubbox'), t('dashboard.colViews'), t('dashboard.colClicks'), t('dashboard.colCtr'), t('dashboard.colStatus')].map(h => (
                      <p key={h} className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{h}</p>
                    ))}
                  </div>
                  {ads.slice(0, 8).map(ad => {
                    const s = adStats.get(ad.id);
                    const v = s?.totalViews || 0;
                    const c = s?.totalClicks || 0;
                    const ctrVal = v > 0 ? ((c / v) * 100).toFixed(1) : '0.0';
                    const isLive = ad.isPaid && ad.isActive && ad.expiryDate && new Date(ad.expiryDate) >= now;
                    return (
                      <div key={ad.id} className="grid grid-cols-5 items-center px-2 py-2 rounded-xl hover:bg-neutral-50 transition-colors">
                        <p className="text-xs font-semibold text-neutral-800 truncate pr-2">{ad.title}</p>
                        <p className="text-xs font-bold text-neutral-700">{v.toLocaleString()}</p>
                        <p className="text-xs font-bold text-neutral-700">{c.toLocaleString()}</p>
                        <p className="text-xs font-bold" style={{ color: Number(ctrVal) >= 5 ? '#059669' : Number(ctrVal) >= 2 ? '#d97706' : '#ef4444' }}>
                          {ctrVal}%
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                          isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
                        }`}>
                          {isLive ? t('dashboard.statusLive') : ad.isPaid ? t('dashboard.statusExpired') : t('dashboard.statusUnpaid')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Country reach detail */}
            <div className={`p-6 rounded-3xl ${glass}`}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-sky-500" />
                </div>
                <h3 className="font-bold text-neutral-800">{t('dashboard.globalReachBreakdown')}</h3>
              </div>
              {overview.topCountries.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <MapPin className="w-10 h-10 text-neutral-200 mb-3" />
                  <p className="text-sm text-neutral-400 font-medium">{t('dashboard.noReachData')}</p>
                  <p className="text-xs text-neutral-300 mt-1">{t('dashboard.activateToTrack')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {overview.topCountries.map(({ country, count }, i) => {
                    const info = getCountryByCode(country);
                    const total = overview.topCountries.reduce((s, c) => s + c.count, 1);
                    const pct = ((count / total) * 100).toFixed(0);
                    return (
                      <div key={country} className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 border border-neutral-100">
                        <span className="text-2xl leading-none">{info?.flag || '🏳️'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-neutral-800">{info?.name || country}</span>
                            <span className="text-xs font-black text-neutral-900">{count} {t('ad.clicks')}</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: i * 0.08, duration: 0.5 }}
                              className="h-full rounded-full"
                              style={{ background: BRAND_GRAD }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-neutral-400 shrink-0">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Spend summary */}
            <div className={`p-6 rounded-3xl ${glass}`}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-bold text-neutral-800">{t('dashboard.spendRoi')}</h3>
              </div>
              <div className="space-y-3">
                <div className="p-5 rounded-2xl text-white" style={{ background: BRAND_GRAD, boxShadow: '0 4px 16px rgba(121,14,97,0.25)' }}>
                  <p className="text-white/70 text-xs font-semibold mb-0.5">{t('dashboard.totalInvested')}</p>
                  <p className="text-3xl font-black">${overview.totalRevenue.toFixed(2)}</p>
                  <p className="text-white/60 text-[11px] mt-1">{t('dashboard.paidYubboxes', { count: ads.filter(a => a.isPaid).length })}</p>
                </div>
                {[
                  { label: t('dashboard.costPerView'),    value: overview.totalViews > 0 ? `$${(overview.totalRevenue / overview.totalViews).toFixed(4)}` : '—' },
                  { label: t('dashboard.costPerClick'),   value: overview.totalClicks > 0 ? `$${(overview.totalRevenue / overview.totalClicks).toFixed(3)}` : '—' },
                  { label: t('dashboard.costPerCountry'), value: overview.countriesReached > 0 ? `$${(overview.totalRevenue / overview.countriesReached).toFixed(2)}` : '—' },
                  { label: t('dashboard.avgEngagement'),  value: overview.totalAds > 0 ? `${(overview.totalYubboxes / overview.totalAds).toFixed(1)} ❤️` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between p-3 rounded-2xl border border-neutral-100 bg-white/40">
                    <span className="text-xs text-neutral-500 font-medium">{label}</span>
                    <span className="text-sm font-black text-neutral-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* ── Tab: Intelligence ──────────────────────────────────────────────── */}
        {activeTab === 'intelligence' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <IntelligencePanel ads={ads} />
          </motion.div>
        )}

        {/* Footer */}
        <div className="pt-4 pb-8 text-center border-t border-neutral-100">
          <div className="flex items-center justify-center gap-2 opacity-30 mb-1">
            <Logo height={28} width={28} showText={false} />
            <span className="text-neutral-400 font-black tracking-widest text-xs">{t('common.footerTagline')}</span>
          </div>
          <p className="text-neutral-400 text-[11px]">{t('common.footerBranding')}</p>
        </div>

      </div>
    </div>
  );
};

export default DashboardContent;
