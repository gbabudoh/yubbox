'use client';

import React, { useState, useCallback } from 'react';
import ManageItems, { ManageableItem } from '@/components/admin/ManageItems';
import { adminService } from '@/services/adminService';

export default function ServiceCategoriesPage() {
  const [categories, setCategories] = useState<ManageableItem[]>([]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await adminService.getCategories(true);
      const serviceCategories = data.filter((cat: any) => cat.type === 'service');
      setCategories(serviceCategories);
    } catch (error) {
      console.error('Failed to load service categories:', error);
    }
  }, []);

  const handleCreate = async (category: Partial<ManageableItem>) => {
    await adminService.createCategory({ ...category, type: 'service' } as any);
    await loadCategories();
  };

  const handleUpdate = async (id: string, category: Partial<ManageableItem>) => {
    await adminService.updateCategory(id, { ...category, type: 'service' } as any);
    await loadCategories();
  };

  const handleDelete = async (id: string) => {
    await adminService.deleteCategory(id);
    await loadCategories();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Categories</h1>
        <p className="text-gray-600 mt-2">Manage categories for service-based products</p>
      </div>
      <ManageItems
        title="Service Categories"
        items={categories}
        onLoad={loadCategories}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        showTypeField={false}
        showOrderField={true}
      />
    </div>
  );
}
