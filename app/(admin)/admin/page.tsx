'use client';

import React, { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n-context';

interface DashboardStats {
  totalUsers: number;
  totalAds: number;
  activeAds: number;
  totalPayments: number;
  totalRevenue: number;
  recentUsers: any[];
  recentAds: any[];
  recentPayments: any[];
}

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your Yubbox platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUsers || 0}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalAds || 0}</p>
            </div>
            <div className="text-4xl">📢</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Ads</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats?.activeAds || 0}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600 mt-2">${stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
          <div className="space-y-3">
            {stats?.recentUsers?.slice(0, 5).map((user: any) => (
              <div key={user._id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Ads */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Ads</h2>
          <div className="space-y-3">
            {stats?.recentAds?.slice(0, 5).map((ad: any) => (
              <div key={ad._id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 truncate">{ad.title}</p>
                  <p className="text-sm text-gray-500">
                    {ad.isPaid ? '✅ Paid' : '❌ Unpaid'} • {ad.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h2>
          <div className="space-y-3">
            {stats?.recentPayments?.slice(0, 5).map((payment: any) => (
              <div key={payment._id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">${payment.amount?.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

