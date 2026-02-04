'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import AdForm from '@/components/AdForm';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n-context';
import { adService } from '@/services/adService';

export default function CreateAdPage() {
  const { status } = useSession();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const handleSubmit = async (formData: FormData) => {
    await adService.createAd(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('ad.createNewAd') || 'Create New Yubbox'}</h1>
            <p className="mt-2 text-gray-600">
              {t('ad.shareProduct')}
            </p>
          </div>
          <LanguageSwitcher />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <AdForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}

