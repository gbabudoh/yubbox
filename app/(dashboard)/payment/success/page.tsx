'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, LayoutDashboard, Globe, Loader2, AlertCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { useI18n } from '@/lib/i18n-context';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionId = searchParams.get('session_id');
  const isSessionLoading = status === 'loading';

  useEffect(() => {
    let isSubscribed = true;
    let timer: NodeJS.Timeout;

    const verifyPayment = async (attempt: number) => {
      if (!sessionId) {
        if (isSubscribed) { setIsLoading(false); setError('No session ID provided'); }
        return;
      }
      if (!isSubscribed) return;

      try {
        await new Promise(r => setTimeout(r, 2000));
        if (!isSubscribed) return;

        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await response.json();

        if (data.success && data.data?.isPaid) {
          if (isSubscribed) {
            setIsLoading(false);
            setTimeout(() => router.push('/dashboard'), 3000);
          }
        } else if (attempt < 5 && isSubscribed) {
          timer = setTimeout(() => verifyPayment(attempt + 1), 2000);
        } else if (isSubscribed) {
          setIsLoading(false);
          setTimeout(() => router.push('/dashboard'), 3000);
        }
      } catch {
        if (isSubscribed) {
          setIsLoading(false);
          setTimeout(() => router.push('/dashboard'), 3000);
        }
      }
    };

    if (sessionId) {
      verifyPayment(0);
    } else {
      const t = setTimeout(() => { if (isSubscribed) setIsLoading(false); }, 0);
      return () => { isSubscribed = false; clearTimeout(t); };
    }

    return () => { isSubscribed = false; if (timer) clearTimeout(timer); };
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* Minimal header */}
      <div className="flex items-center justify-center py-5 border-b border-neutral-100 bg-white/70 backdrop-blur-sm">
        <Link href="/">
          <Logo height={40} width={40} disableLink />
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-morphism rounded-4xl p-10 max-w-md w-full text-center"
        >
          {isLoading || isSessionLoading ? (
            <div className="space-y-5">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{ background: 'rgba(121,14,97,0.08)' }}>
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#790e61' }} />
              </div>
              <h2 className="text-2xl font-black text-neutral-900">{t('payment.processing')}</h2>
              <p className="text-sm text-neutral-400">
                {!session ? 'Restoring your session...' : 'Verifying your payment...'}
              </p>
              <div className="flex justify-center gap-1.5 pt-2">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#790e61' }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="space-y-5">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-black text-neutral-900">{t('payment.failed')}</h2>
              <p className="text-sm text-neutral-500">{error}</p>
              <Link href="/dashboard">
                <button className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)' }}>
                  {t('payment.backToDashboard')}
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-black text-neutral-900 mb-1">{t('payment.success')}</h2>
                <p className="text-sm text-neutral-500">{t('payment.successMessage')}</p>
              </div>

              {/* Live indicator */}
              <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full mx-auto w-fit border"
                style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-600">Your listing is now live</span>
              </div>

              <div className="pt-2 space-y-3">
                <Link href="/dashboard">
                  <button className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)', boxShadow: '0 4px 16px rgba(121,14,97,0.3)' }}>
                    <LayoutDashboard className="w-4 h-4" />
                    {t('payment.viewDashboard')}
                  </button>
                </Link>
                <Link href="/">
                  <button className="w-full py-2.5 rounded-xl font-semibold text-sm border border-neutral-200 hover:bg-neutral-50 transition-colors text-neutral-600 flex items-center justify-center gap-2">
                    <Globe className="w-4 h-4" />
                    Browse Listings
                  </button>
                </Link>
                <p className="text-xs text-neutral-400">{t('payment.redirecting')}</p>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <Footer variant="simple" />
    </div>
  );
}
