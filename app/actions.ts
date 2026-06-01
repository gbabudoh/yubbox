'use server';

import { cookies } from 'next/headers';
import { locales, defaultLocale } from '@/lib/i18n';

export async function setLocaleCookie(locale: string) {
  const valid = locales.find((l) => l.code === locale)?.code ?? defaultLocale;
  const store = await cookies();
  store.set('locale', valid, {
    path:    '/',
    maxAge:  60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });
}
