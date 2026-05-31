'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import AdForm from '@/components/AdForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useI18n } from '@/lib/i18n-context';
import { adService } from '@/services/adService';

export default function CreateAdPage() {
  const { status } = useSession();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-[#790e61]/20 border-t-[#790e61] animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const handleSubmit = async (formData: FormData) => {
    await adService.createAd(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="pt-36 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-neutral-900 mb-1">{t('ad.createNewAd')}</h1>
          <p className="text-sm text-neutral-400 font-medium">{t('ad.shareProduct')}</p>
        </div>
        <AdForm onSubmit={handleSubmit} />
      </main>
      <Footer />
    </div>
  );
}
