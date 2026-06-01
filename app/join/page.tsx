'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function JoinRedirect() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const ref          = searchParams.get('ref');

  useEffect(() => {
    if (ref) sessionStorage.setItem('referralCode', ref);
    router.replace('/register');
  }, [ref, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-[#790e61]/20 border-t-[#790e61] animate-spin" />
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <JoinRedirect />
    </Suspense>
  );
}
