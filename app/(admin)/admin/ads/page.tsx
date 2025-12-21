'use client';

import React, { useEffect, useState } from 'react';

interface Ad {
  _id: string;
  title: string;
  description: string;
  isPaid: boolean;
  isActive: boolean;
  userId: any;
  createdAt: string;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, paid, unpaid, active, inactive

  useEffect(() => {
    fetchAds();
  }, [filter]);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      let url = '/api/ads?';
      if (filter === 'paid') url += 'isPaid=true&';
      if (filter === 'unpaid') url += 'isPaid=false&';
      if (filter === 'active') url += 'isActive=true&';
      if (filter === 'inactive') url += 'isActive=false&';

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAds(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Ads</h1>
          <p className="text-gray-600 mt-2">Manage all Yubbox listings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-2">
          {['all', 'paid', 'unpaid', 'active', 'inactive'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Ads Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad._id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{ad.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ad.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    ad.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {ad.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    ad.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {ad.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(ad.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

