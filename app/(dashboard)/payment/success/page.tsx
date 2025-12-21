'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Logo from '@/components/Logo';
import { useI18n } from '@/lib/i18n-context';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyAttempts, setVerifyAttempts] = useState(0);
  const sessionId = searchParams.get('session_id');
  
  // Allow page to load even if session is loading - payment is handled by webhook
  const isSessionLoading = status === 'loading';

  useEffect(() => {
    // Verify payment status with backend
    const verifyPayment = async () => {
      if (!sessionId) {
        setIsLoading(false);
        setError('No session ID provided');
        return;
      }

      try {
        // Wait a moment for webhook to process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Verify payment status
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (data.success && data.data?.isPaid) {
          setIsLoading(false);
          // Payment verified, redirect after showing success
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          // Payment not yet processed, try again (max 5 attempts = 10 seconds)
          if (verifyAttempts < 5) {
            setVerifyAttempts(prev => prev + 1);
            setTimeout(() => {
              verifyPayment();
            }, 2000);
          } else {
            // Max attempts reached, show success anyway (webhook will process)
            setIsLoading(false);
            setTimeout(() => {
              router.push('/dashboard');
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setIsLoading(false);
        // Still show success page - webhook will process it
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    };

    if (sessionId) {
      verifyPayment();
    } else {
      setIsLoading(false);
    }
  }, [sessionId, router, verifyAttempts]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <Logo height={120} width={120} className="justify-center mx-auto" />
        
        {isLoading || isSessionLoading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600">{t('payment.processing') || 'Processing your payment...'}</p>
            {!session && (
              <p className="text-sm text-gray-500 mt-2">
                {t('payment.sessionRestore') || 'Restoring your session...'}
              </p>
            )}
          </>
        ) : error ? (
          <>
            <div className="text-red-600 text-6xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('payment.failed') || 'Payment Failed'}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/dashboard">
              <Button variant="logo">{t('payment.backToDashboard') || 'Back to Dashboard'}</Button>
            </Link>
          </>
        ) : (
          <>
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('payment.success') || 'Payment Successful!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('payment.successMessage') || 'Your Yubbox has been activated and will be live for 30 days.'}
            </p>
            <div className="space-y-3">
              <Link href="/dashboard">
                <Button variant="logo" className="w-full">
                  {t('payment.viewDashboard') || 'View Dashboard'}
                </Button>
              </Link>
              <p className="text-sm text-gray-500">
                {t('payment.redirecting') || 'Redirecting to dashboard in a few seconds...'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

