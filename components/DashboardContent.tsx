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
  Bell,
  ArrowUpRight,
  BarChart3,
  Package,
  Mail
} from 'lucide-react';
import DashboardAdCard from './DashboardAdCard';
import Button from './ui/Button';
import Logo from './Logo';
import AdminLink from './admin/AdminLink';
import LanguageSwitcher from './LanguageSwitcher';
import { useI18n } from '@/lib/i18n-context';
import { IAd } from '@/types/models';
import { adService } from '@/services/adService';
import { analyticsService } from '@/services/analyticsService';

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
      setError(
        err instanceof Error ? err.message : 'Failed to load your ads'
      );
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const checkAdminAndRedirect = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/check');
      if (response.ok) {
        const data = await response.json();
        if (data.isAdmin) {
          router.push('/admin');
          return;
        }
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

    const activeAds = ads.filter(
      (ad) =>
        ad.isPaid &&
        ad.isActive &&
        ad.expiryDate &&
        new Date(ad.expiryDate) >= now
    );
    const expiredAds = ads.filter(
      (ad) => ad.expiryDate && new Date(ad.expiryDate) < now
    );
    const unpaidAds = ads.filter((ad) => !ad.isPaid);

    try {
      const analyticsPromises = ads.map((ad) =>
        analyticsService.getAnalytics(String(ad._id)).catch(() => null)
      );
      const analyticsResults = await Promise.all(analyticsPromises);

      analyticsResults.forEach((analytics) => {
        if (analytics?.statistics) {
          totalViews += analytics.statistics.totalViews || 0;
          totalClicks += analytics.statistics.totalClicks || 0;
        }
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }

    const paidAds = ads.filter((ad) => ad.isPaid);
    const totalRevenue = paidAds.length * 1.0;

    setStats({
      totalAds: ads.length,
      activeAds: activeAds.length,
      expiredAds: expiredAds.length,
      unpaidAds: unpaidAds.length,
      totalViews,
      totalClicks,
      totalRevenue,
    });
  }, [ads]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      checkAdminAndRedirect();
    }
  }, [status, session, router, checkAdminAndRedirect]);

  useEffect(() => {
    if (ads.length > 0) {
      calculateStats();
    }
  }, [ads, calculateStats]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">{t('common.loading')}</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const clickThroughRate =
    stats.totalViews > 0
      ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(2)
      : '0.00';

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const glassStyle = "bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-purple-500/5";

  return (
    <div className="min-h-screen bg-[#fcfaff] relative overflow-hidden font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-pink-100/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10"
      >
        {/* Header Hero Section */}
        <motion.div variants={itemVariants} className={`mb-10 p-8 rounded-3xl ${glassStyle} relative z-40`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Logo height={100} width={100} showText={false} />
              </div>
              
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">{session?.user?.name}</span>
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100 shadow-sm">
                    <Mail className="w-4 h-4" />
                    {session?.user?.email}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100 shadow-sm">
                    <Globe className="w-4 h-4" />
                    {t('ad.myAds') || 'Dashboard'}
                  </div>
                  <AdminLink />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
              <div className="p-1.5 bg-gray-100/50 rounded-2xl border border-gray-200/50 relative z-10">
                <LanguageSwitcher />
              </div>
              
              <Link href="/ads/create">
                <Button className="rounded-xl px-5 py-2.5 h-auto font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-200 transition-all active:scale-95 flex items-center gap-2">
                  <div className="bg-white/20 p-1 rounded-md">
                    <Plus className="w-4 h-4" />
                  </div>
                  {t('ad.createNewAd') || 'Create New Yubbox'}
                </Button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
              >
                <LogOut className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-4 bg-red-50/80 backdrop-blur-md border border-red-200 rounded-2xl text-red-600 flex items-center gap-3 shadow-lg shadow-red-500/5"
          >
            <Bell className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: t('ad.totalAds') || 'Total Ads', value: stats.totalAds, icon: Package, color: 'bg-blue-50 text-blue-600 border-blue-100', iconBg: 'bg-blue-100' },
            { label: t('ad.activeAds') || 'Active Ads', value: stats.activeAds, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', iconBg: 'bg-emerald-100' },
            { label: t('ad.totalViews') || 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'bg-purple-50 text-purple-600 border-purple-100', iconBg: 'bg-purple-100' },
            { label: t('ad.totalClicks') || 'Total Clicks', value: stats.totalClicks.toLocaleString(), icon: MousePointerClick, color: 'bg-orange-50 text-orange-600 border-orange-100', iconBg: 'bg-orange-100', sub: `${clickThroughRate}% CTR` },
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`p-6 rounded-3xl ${glassStyle} border transition-all relative overflow-hidden group`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.iconBg}/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-opacity-20 transition-all`} />
              
              <div className="flex flex-col h-full justify-between relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${stat.iconBg} ${stat.color.split(' ')[1]}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  {stat.sub && <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">{stat.sub}</span>}
                </div>
                <div>
                  <p className="text-gray-500 font-medium text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Secondary Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Ad Status Breakdown */}
          <motion.div variants={itemVariants} className={`p-8 rounded-3xl ${glassStyle}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Layout className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{t('ad.adStatus') || 'Ad Status'}</h3>
            </div>
            <div className="space-y-6">
              {[
                { label: t('ad.expiredAds') || 'Expired Ads', value: stats.expiredAds, color: 'text-orange-600', bg: 'bg-orange-50', barColor: 'bg-orange-500' },
                { label: t('ad.unpaidAds') || 'Unpaid Ads', value: stats.unpaidAds, color: 'text-red-600', bg: 'bg-red-50', barColor: 'bg-red-500' }
              ].map((row, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">{row.label}</span>
                    <span className={`text-xl font-black ${row.color}`}>{row.value}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: stats.totalAds > 0 ? `${(row.value / stats.totalAds) * 100}%` : '0%' }}
                      className={`h-full ${row.barColor}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance Insight */}
          <motion.div variants={itemVariants} className={`p-8 rounded-3xl ${glassStyle}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{t('ad.performance') || 'Performance'}</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
                <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">{t('ad.clickThroughRate') || 'CTR'}</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-gray-900">{clickThroughRate}%</span>
                  <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/50 border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{t('ad.avgViewsPerAd') || 'Avg Views/Ad'}</p>
                <span className="text-2xl font-bold text-gray-900">
                  {stats.totalAds > 0 ? Math.round(stats.totalViews / stats.totalAds) : 0}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Financial Insight */}
          <motion.div variants={itemVariants} className={`p-8 rounded-3xl ${glassStyle}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{t('ad.revenue') || 'Investment'}</h3>
            </div>
            <div className="space-y-4">
              <div className="p-5 bg-emerald-500 rounded-[2rem] text-white shadow-lg shadow-emerald-500/20">
                <p className="text-emerald-100 text-sm font-medium mb-1">{t('ad.totalSpent') || 'Total Spent'}</p>
                <p className="text-3xl font-black">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-600">{t('ad.avgCostPerAd') || 'Avg Cost/Ad'}</span>
                </div>
                <span className="font-bold text-gray-900">
                  ${stats.totalAds > 0 ? (stats.totalRevenue / stats.totalAds).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content: Advertisements */}
        <motion.div variants={itemVariants} className={`rounded-[2.5rem] overflow-hidden ${glassStyle} p-8`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                {t('ad.yourAds') || 'Your Advertisements'}
              </h2>
              <p className="text-gray-500 font-medium">Manage and monitor your global yubbox listings</p>
            </div>
            
            {ads.length > 0 && (
              <div className="flex gap-2">
                <Link href="/ads/create">
                  <Button variant="outline" className="rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {t('ad.createNewAd') || 'Add New'}
                  </Button>
                </Link>
                <div className="p-2 bg-gray-50 rounded-xl border border-gray-200">
                  <BarChart3 className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {ads.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center justify-center py-20 px-6 text-center"
              >
                <motion.div 
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="mb-8 p-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-[3rem] text-purple-600 relative"
                >
                  <Package className="w-20 h-20" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-4 border-purple-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                  </div>
                </motion.div>
                
                <h3 className="text-2xl font-black text-gray-900 mb-2">No active yubbox yet</h3>
                <p className="text-gray-500 font-medium max-w-sm mx-auto mb-10">
                  {t('ad.noAdsYet') || "Time to shine! Create your first advertisement and reach a global audience today."}
                </p>
                
                <Link href="/ads/create">
                  <motion.button
                  whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-2 group text-sm"
                  >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    {t('home.createFirstAd') || 'Create Your First Yubbox'}
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {ads.map((ad, idx) => (
                  <motion.div 
                    key={String(ad._id)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <DashboardAdCard ad={ad} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Footer Decoration */}
      <div className="mt-20 py-10 text-center relative z-10 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="opacity-30">
            <Logo height={40} width={40} showText={false} />
          </div>
          <span className="text-gray-300 font-black tracking-widest text-sm">{t('common.footerTagline') || 'YUBBOX ADVERTISING'}</span>
        </div>
        <p className="text-gray-400 text-xs px-4">{t('common.footerBranding') || '© 2026 Yubbox Platform. The Global Ad System'}</p>
      </div>
    </div>
  );
};

export default DashboardContent;
