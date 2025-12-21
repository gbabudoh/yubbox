'use client';

import React, { useEffect, useState } from 'react';
import { IAd } from '@/types/models';
import { analyticsService } from '@/services/analyticsService';
import { useI18n } from '@/lib/i18n-context';
import { getCountryByCode } from '@/lib/countries';

interface AdAnalyticsProps {
  ad: IAd;
}

const AdAnalytics: React.FC<AdAnalyticsProps> = ({ ad }) => {
  const { t } = useI18n();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [ad._id]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsService.getAnalytics(String(ad._id));
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics || !analytics.statistics) {
    return (
      <div className="p-4 text-center text-gray-500">
        {t('ad.noAnalytics') || 'No analytics data available yet'}
      </div>
    );
  }

  const { statistics } = analytics;
  const ctr = statistics.clickThroughRate?.toFixed(2) || '0.00';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            {t('ad.totalViews') || 'Total Views'}
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {statistics.totalViews || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            {t('ad.totalClicks') || 'Total Clicks'}
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {statistics.totalClicks || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            {t('ad.clickThroughRate') || 'Click-Through Rate'}
          </h3>
          <p className="text-2xl font-bold text-gray-900">{ctr}%</p>
        </div>
      </div>

      {/* Country Breakdown */}
      {statistics.countryStats && statistics.countryStats.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('ad.clicksByCountry') || 'Clicks by Country'}
          </h3>
          <div className="space-y-2">
            {statistics.countryStats.map((stat: any, index: number) => {
              const country = getCountryByCode(stat._id);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-2">
                    {country && <span className="text-lg">{country.flag}</span>}
                    <span className="font-medium">
                      {country ? country.name : stat._id || 'Unknown'}
                    </span>
                  </div>
                  <span className="text-gray-600 font-semibold">
                    {stat.count} {t('ad.clicks') || 'clicks'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hourly Breakdown */}
      {statistics.hourlyStats && statistics.hourlyStats.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('ad.clicksByHour') || 'Clicks by Hour of Day'}
          </h3>
          <div className="grid grid-cols-12 gap-2">
            {Array.from({ length: 24 }).map((_, hour) => {
              const hourStat = statistics.hourlyStats.find(
                (h: any) => h._id === hour
              );
              const count = hourStat?.count || 0;
              const maxCount = Math.max(
                ...statistics.hourlyStats.map((h: any) => h.count),
                1
              );
              const height = (count / maxCount) * 100;

              return (
                <div key={hour} className="flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-t h-32 flex items-end">
                    {count > 0 && (
                      <div
                        className="w-full bg-blue-600 rounded-t transition-all"
                        style={{ height: `${height}%` }}
                        title={`${hour}:00 - ${count} clicks`}
                      />
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{hour}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Breakdown */}
      {statistics.dailyStats && statistics.dailyStats.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('ad.clicksLast30Days') || 'Clicks (Last 30 Days)'}
          </h3>
          <div className="space-y-2">
            {statistics.dailyStats.map((stat: any, index: number) => {
              const maxCount = Math.max(
                ...statistics.dailyStats.map((s: any) => s.count),
                1
              );
              const width = (stat.count / maxCount) * 100;

              return (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 w-24">
                    {stat._id}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    {stat.count > 0 && (
                      <div
                        className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${width}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {stat.count}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdAnalytics;

