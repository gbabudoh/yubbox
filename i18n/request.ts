import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { locales, defaultLocale } from '@/lib/i18n';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw    = cookieStore.get('locale')?.value ?? defaultLocale;
  // Validate against the allowed list to prevent path traversal
  const locale = (locales.find((l) => l.code === raw)?.code ?? defaultLocale) as string;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
