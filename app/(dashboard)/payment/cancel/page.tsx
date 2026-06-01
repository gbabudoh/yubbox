'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle, LayoutDashboard, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { useI18n } from '@/lib/i18n-context';

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const adId = searchParams.get('adId');

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
          className="glass-morphism rounded-4xl p-10 max-w-md w-full text-center space-y-5"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-full bg-orange-50 flex items-center justify-center"
          >
            <XCircle className="w-10 h-10 text-orange-400" />
          </motion.div>

          <div>
            <h2 className="text-2xl font-black text-neutral-900 mb-1">{t('payment.cancelled')}</h2>
            <p className="text-sm text-neutral-500">{t('payment.cancelledMessage')}</p>
          </div>

          <div className="pt-2 space-y-3">
            {adId && (
              <Link href={`/ads/${adId}`}>
                <button
                  className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#790e61,#c41e8a)', boxShadow: '0 4px 16px rgba(121,14,97,0.3)' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('payment.backToAd')}
                </button>
              </Link>
            )}
            <Link href="/dashboard">
              <button className="w-full py-2.5 rounded-xl font-semibold text-sm border border-neutral-200 hover:bg-neutral-50 transition-colors text-neutral-600 flex items-center justify-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                {t('payment.backToDashboard')}
              </button>
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer variant="simple" />
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense>
      <PaymentCancelContent />
    </Suspense>
  );
}
