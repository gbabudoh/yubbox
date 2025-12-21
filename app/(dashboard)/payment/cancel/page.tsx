'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Logo from '@/components/Logo';
import { useI18n } from '@/lib/i18n-context';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const adId = searchParams.get('adId');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <Logo height={120} width={120} className="justify-center mx-auto" />
        
        <div className="text-yellow-600 text-6xl mb-4">⚠</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('payment.cancelled') || 'Payment Cancelled'}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('payment.cancelledMessage') || 'Your payment was cancelled. No charges were made.'}
        </p>
        <div className="space-y-3">
          {adId ? (
            <Link href={`/ads/${adId}`}>
              <Button variant="logo" className="w-full">
                {t('payment.backToAd') || 'Back to Ad'}
              </Button>
            </Link>
          ) : null}
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              {t('payment.backToDashboard') || 'Back to Dashboard'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

