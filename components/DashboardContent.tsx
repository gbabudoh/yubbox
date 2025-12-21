'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardAdCard from './DashboardAdCard';
import Button from './ui/Button';
import Logo from './Logo';
import AdminLink from './admin/AdminLink';
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      // Check if user is admin and redirect to admin dashboard
      checkAdminAndRedirect();
    }
  }, [status, session, router]);

  const checkAdminAndRedirect = async () => {
    try {
      const response = await fetch('/api/admin/check');
      if (response.ok) {
        const data = await response.json();
        if (data.isAdmin) {
          router.push('/admin');
          return;
        }
      }
      // Only fetch ads if not admin
      fetchUserAds();
    } catch (error) {
      // Ignore errors, just continue with regular dashboard
      fetchUserAds();
    }
  };

  useEffect(() => {
    if (ads.length > 0) {
      calculateStats();
    }
  }, [ads]);

  const fetchUserAds = async () => {
    try {
      setIsLoading(true);
      const userAds = await adService.getUserAds(session?.user?.id || '');
      setAds(userAds);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load your ads'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = async () => {
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

    // Fetch analytics for all ads
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

    // Calculate revenue (assuming $1 per ad payment)
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
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const clickThroughRate =
    stats.totalViews > 0
      ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(2)
      : '0.00';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="mb-4">
                  <Logo height={140} width={140} showText={false} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="font-medium">{session?.user?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{session?.user?.email}</span>
                  </div>
                </div>
              </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                    <span className="px-4 py-2 bg-[#70075a] text-white rounded-full text-sm font-semibold shadow-md whitespace-nowrap">
                      {t('ad.myAds') || 'My Yubbox'}
                    </span>
                    <Link href="/ads/create">
                      <Button variant="logo" size="lg" className="w-full md:w-auto">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        {t('ad.createAd') || 'Create New Yubbox'}
                      </Button>
                    </Link>
                    <AdminLink />
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full md:w-auto"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      {t('nav.logout') || 'Sign Out'}
                    </Button>
                  </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t('ad.totalAds') || 'Total Ads'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalAds}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t('ad.activeAds') || 'Active Ads'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.activeAds}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t('ad.totalViews') || 'Total Views'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t('ad.totalClicks') || 'Total Clicks'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalClicks.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('ad.clickThroughRate') || 'CTR'}: {clickThroughRate}%
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('ad.adStatus') || 'Ad Status'}
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {t('ad.expiredAds') || 'Expired'}
                </span>
                <span className="text-2xl font-bold text-orange-600">
                  {stats.expiredAds}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {t('ad.unpaidAds') || 'Unpaid'}
                </span>
                <span className="text-2xl font-bold text-red-600">
                  {stats.unpaidAds}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('ad.performance') || 'Performance'}
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {t('ad.clickThroughRate') || 'Click-Through Rate'}
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {clickThroughRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {t('ad.avgViewsPerAd') || 'Avg Views/Ad'}
                </span>
                <span className="text-2xl font-bold text-purple-600">
                  {stats.totalAds > 0
                    ? Math.round(stats.totalViews / stats.totalAds)
                    : 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('ad.revenue') || 'Revenue'}
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {t('ad.totalSpent') || 'Total Spent'}
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ${stats.totalRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {t('ad.avgCostPerAd') || 'Avg Cost/Ad'}
                </span>
                <span className="text-2xl font-bold text-gray-600">
                  ${stats.totalAds > 0 ? (stats.totalRevenue / stats.totalAds).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ads Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('ad.yourAds') || 'Your Advertisements'}
            </h2>
            <div className="flex gap-2">
              <Link href="/ads/create">
                <Button variant="logo" size="sm">
                  {t('ad.createAd') || 'Create New Yubbox'}
                </Button>
              </Link>
            </div>
          </div>

          {ads.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4 text-lg">
                {t('ad.noAdsYet') || "You haven't created any ads yet."}
              </p>
              <Link href="/ads/create">
                <Button variant="logo" size="lg">
                  {t('home.createFirstAd') || 'Create Your First Ad'}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <DashboardAdCard
                  key={String(ad._id)}
                  ad={ad}
                  onUpdate={fetchUserAds}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
