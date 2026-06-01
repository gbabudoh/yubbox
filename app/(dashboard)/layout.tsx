'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Persistent session guard for the entire dashboard region.
// If the session expires or the user is unauthenticated, they are
// immediately sent to /login regardless of which sub-page they're on.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router     = useRouter();
  const pathname   = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  // While session is resolving, render nothing to avoid flash
  if (status === 'loading') return null;

  return <>{children}</>;
}
