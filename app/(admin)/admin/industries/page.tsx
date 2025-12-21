'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ManageItems, { ManageableItem } from '@/components/admin/ManageItems';
import { adminService } from '@/services/adminService';
import { useI18n } from '@/lib/i18n-context';

export default function IndustriesPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [industries, setIndustries] = useState<ManageableItem[]>([]);

  const loadIndustries = useCallback(async () => {
    try {
      const data = await adminService.getIndustries(true);
      setIndustries(data);
    } catch (error) {
      console.error('Failed to load industries:', error);
    }
  }, []);

  const handleCreate = async (industry: Partial<ManageableItem>) => {
    await adminService.createIndustry(industry);
    await loadIndustries();
  };

  const handleUpdate = async (id: string, industry: Partial<ManageableItem>) => {
    await adminService.updateIndustry(id, industry);
    await loadIndustries();
  };

  const handleDelete = async (id: string) => {
    await adminService.deleteIndustry(id);
    await loadIndustries();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Industries</h1>
        <p className="text-gray-600 mt-2">Manage industry classifications</p>
      </div>
      <ManageItems
        title={t('admin.industries') || 'Industries'}
        items={industries}
        onLoad={loadIndustries}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        showOrderField={true}
      />
    </div>
  );
}

