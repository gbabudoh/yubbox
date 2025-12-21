'use client';

import React, { useEffect } from 'react';
import { useI18n } from '@/lib/i18n-context';

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();

  useEffect(() => {
    // Set HTML lang attribute
    document.documentElement.lang = locale;
    
    // Set RTL for Arabic
    if (locale === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [locale]);

  return <>{children}</>;
}

