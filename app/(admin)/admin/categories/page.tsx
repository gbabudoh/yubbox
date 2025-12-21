'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ManageItems, { ManageableItem } from '@/components/admin/ManageItems';
import { adminService } from '@/services/adminService';
import { useI18n } from '@/lib/i18n-context';

export default function CategoriesPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [categories, setCategories] = useState<ManageableItem[]>([]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await adminService.getCategories(true);
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  const handleCreate = async (category: Partial<ManageableItem>) => {
    await adminService.createCategory(category);
    await loadCategories();
  };

  const handleUpdate = async (id: string, category: Partial<ManageableItem>) => {
    await adminService.updateCategory(id, category);
    await loadCategories();
  };

  const handleDelete = async (id: string) => {
    await adminService.deleteCategory(id);
    await loadCategories();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-600 mt-2">Manage product/service categories</p>
      </div>
      <ManageItems
        title={t('admin.categories') || 'Categories'}
        items={categories}
        onLoad={loadCategories}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        showTypeField={true}
        showOrderField={true}
      />
    </div>
  );
}

