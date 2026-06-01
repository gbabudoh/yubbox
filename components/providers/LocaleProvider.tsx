'use client';

// lang and dir are now set server-side in app/layout.tsx via next-intl.
// This component is kept as a no-op so existing imports continue to compile.
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
