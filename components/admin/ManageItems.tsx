'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n-context';

export interface ManageableItem {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  order?: number;
  type?: 'service' | 'physical';
}

interface ManageItemsProps {
  title: string;
  items: ManageableItem[];
  onLoad: () => Promise<void>;
  onCreate: (item: Partial<ManageableItem>) => Promise<void>;
  onUpdate: (id: string, item: Partial<ManageableItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  showTypeField?: boolean;
  showOrderField?: boolean;
}

export default function ManageItems({
  title,
  items,
  onLoad,
  onCreate,
  onUpdate,
  onDelete,
  showTypeField = false,
  showOrderField = true,
}: ManageItemsProps) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ManageableItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
    isActive: true,
    type: 'service' as 'service' | 'physical',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  const handleOpenModal = (item?: ManageableItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || '',
        description: item.description || '',
        order: item.order || 0,
        isActive: item.isActive !== undefined ? item.isActive : true,
        type: (item.type as 'service' | 'physical') || 'service',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        order: 0,
        isActive: true,
        type: 'service',
      });
    }
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (editingItem) {
        await onUpdate(editingItem._id, formData);
      } else {
        await onCreate(formData);
      }
      handleCloseModal();
      await onLoad();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirmDelete') || 'Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await onDelete(id);
      await onLoad();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleToggleActive = async (item: ManageableItem) => {
    try {
      await onUpdate(item._id, { isActive: !item.isActive });
      await onLoad();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-2">
              {t('admin.manageItems') || 'Create, edit, and manage items'}
            </p>
          </div>
          <Button variant="logo" onClick={() => handleOpenModal()}>
            {t('admin.addNew') || '+ Add New'}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.name') || 'Name'}
                </th>
                {showTypeField && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.type') || 'Type'}
                  </th>
                )}
                {showOrderField && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.order') || 'Order'}
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.status') || 'Status'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={showTypeField ? 5 : 4} className="px-6 py-4 text-center text-gray-500">
                    {t('admin.noItems') || 'No items found'}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500">{item.description}</div>
                      )}
                    </td>
                    {showTypeField && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {item.type}
                        </span>
                      </td>
                    )}
                    {showOrderField && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.order || 0}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.isActive
                          ? t('admin.active') || 'Active'
                          : t('admin.inactive') || 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        {t('admin.edit') || 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('admin.delete') || 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingItem ? t('admin.editItem') || 'Edit Item' : t('admin.addItem') || 'Add New Item'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('admin.name') || 'Name'}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.description') || 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            {showTypeField && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.type') || 'Type'}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as 'service' | 'physical' })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="service">{t('admin.service') || 'Service'}</option>
                  <option value="physical">{t('admin.physical') || 'Physical'}</option>
                </select>
              </div>
            )}
            {showOrderField && (
              <Input
                label={t('admin.order') || 'Order'}
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
            )}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                {t('admin.active') || 'Active'}
              </label>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="logo" isLoading={isLoading}>
                {editingItem ? t('common.save') : t('admin.create') || 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

