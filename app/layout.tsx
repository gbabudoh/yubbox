import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import { I18nProvider } from '@/lib/i18n-context';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Yubbox - Global Advertising Platform',
  description: 'Simple, affordable, and effective global advertising for your products and services',
  icons: { icon: '/favicon.png', apple: '/favicon.png' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale   = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <I18nProvider>
            <SessionProvider>
              {children}
            </SessionProvider>
          </I18nProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
