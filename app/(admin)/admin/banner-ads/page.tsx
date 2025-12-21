'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useI18n } from '@/lib/i18n-context';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface BannerAd {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  cost: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  displayOrder: number;
  createdBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function BannerAdsPage() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [bannerAds, setBannerAds] = useState<BannerAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerAd | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    cost: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    displayOrder: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadBannerAds();
  }, []);

  const loadBannerAds = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/banner-ads?includeInactive=true');
      const data = await response.json();
      if (data.success) {
        setBannerAds(data.data);
      }
    } catch (error) {
      console.error('Failed to load banner ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      cost: 0,
      startDate: '',
      endDate: '',
      isActive: true,
      displayOrder: 0,
    });
    setError('');
    setShowModal(true);
  };

  const handleEdit = (banner: BannerAd) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      cost: banner.cost,
      startDate: banner.startDate.split('T')[0],
      endDate: banner.endDate.split('T')[0],
      isActive: banner.isActive,
      displayOrder: banner.displayOrder,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingBanner
        ? `/api/admin/banner-ads/${editingBanner._id}`
        : '/api/admin/banner-ads';
      
      const method = editingBanner ? 'PUT' : 'POST';

      const payload = editingBanner ? formData : { ...formData, createdBy: session?.user?.id };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        await loadBannerAds();
      } else {
        setError(data.error || 'Failed to save banner ad');
      }
    } catch (error) {
      setError('An error occurred while saving');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner ad?')) return;

    try {
      const response = await fetch(`/api/admin/banner-ads/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadBannerAds();
      } else {
        alert(data.error || 'Failed to delete banner ad');
      }
    } catch (error) {
      alert('An error occurred while deleting');
    }
  };

  const isActive = (banner: BannerAd) => {
    const now = new Date();
    const start = new Date(banner.startDate);
    const end = new Date(banner.endDate);
    return banner.isActive && start <= now && now <= end;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner Ads</h1>
          <p className="text-gray-600 mt-2">Manage premium banner advertisements</p>
        </div>
        <Button onClick={handleCreate}>
          + Create Banner Ad
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Banner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bannerAds.map((banner) => (
              <tr key={banner._id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="h-12 w-24 object-cover rounded"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {banner.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${banner.cost.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(banner.startDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    to {new Date(banner.endDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      isActive(banner)
                        ? 'bg-green-100 text-green-800'
                        : banner.isActive
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isActive(banner) ? 'Active' : banner.isActive ? 'Scheduled' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {banner.displayOrder}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bannerAds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No banner ads found. Create your first one!</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingBanner ? 'Edit Banner Ad' : 'Create Banner Ad'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Input
            label="Title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            maxLength={100}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              maxLength={500}
            />
          </div>

          <Input
            label="Image URL"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            required
            placeholder="https://example.com/banner.jpg"
          />

          <Input
            label="Link URL"
            type="url"
            value={formData.linkUrl}
            onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
            required
            placeholder="https://example.com"
          />

          <Input
            label="Cost ($)"
            type="number"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
            required
            min="0"
            step="0.01"
          />

          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />

          <Input
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />

          <Input
            label="Display Order"
            type="number"
            value={formData.displayOrder}
            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
            min="0"
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={() => setShowModal(false)}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingBanner ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
