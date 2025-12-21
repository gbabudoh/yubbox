'use client';

import React, { useEffect, useState } from 'react';

interface Activity {
  type: string;
  description: string;
  user?: string;
  userId?: string;
  adId?: string;
  country?: string;
  amount?: number;
  status?: string;
  timestamp: string;
}

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchActivities();
  }, [filter, page]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/activities?type=${filter}&page=${page}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.data.activities);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_created':
        return '👤';
      case 'ad_created':
        return '📢';
      case 'payment':
        return '💳';
      case 'ad_view':
        return '👁️';
      case 'ad_click':
        return '🖱️';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_created':
        return 'bg-blue-100 text-blue-700';
      case 'ad_created':
        return 'bg-green-100 text-green-700';
      case 'payment':
        return 'bg-yellow-100 text-yellow-700';
      case 'ad_view':
        return 'bg-purple-100 text-purple-700';
      case 'ad_click':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600 mt-2">Monitor all user activities and system events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-2">
          {['all', 'user_created', 'ad_created', 'payment', 'ad_view', 'ad_click'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilter(type);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All' : type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No activities found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activities.map((activity, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  <div className={`text-2xl ${getActivityColor(activity.type).split(' ')[0]} p-2 rounded-lg`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      {activity.user && <span>User: {activity.user}</span>}
                      {activity.country && <span>Country: {activity.country}</span>}
                      {activity.amount && <span>Amount: ${activity.amount.toFixed(2)}</span>}
                      {activity.status && (
                        <span className={`px-2 py-1 rounded ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {activity.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${getActivityColor(activity.type)}`}>
                    {activity.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

