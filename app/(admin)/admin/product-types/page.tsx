'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ManageItems, { ManageableItem } from '@/components/admin/ManageItems';
import { adminService } from '@/services/adminService';
import { useI18n } from '@/lib/i18n-context';

export default function ProductTypesPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [productTypes, setProductTypes] = useState<ManageableItem[]>([]);

  const loadProductTypes = useCallback(async () => {
    try {
      const data = await adminService.getProductTypes(true);
      setProductTypes(data);
    } catch (error) {
      console.error('Failed to load product types:', error);
    }
  }, []);

  const handleCreate = async (productType: Partial<ManageableItem>) => {
    await adminService.createProductType(productType);
    await loadProductTypes();
  };

  const handleUpdate = async (id: string, productType: Partial<ManageableItem>) => {
    await adminService.updateProductType(id, productType);
    await loadProductTypes();
  };

  const handleDelete = async (id: string) => {
    await adminService.deleteProductType(id);
    await loadProductTypes();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Types</h1>
        <p className="text-gray-600 mt-2">Manage service and physical product types</p>
      </div>
      <ManageItems
        title={t('admin.productTypes') || 'Product Types'}
        items={productTypes}
        onLoad={loadProductTypes}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        showOrderField={true}
      />
    </div>
  );
}

