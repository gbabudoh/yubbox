import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  // pg uses native Node.js bindings — must not be bundled by Next.js/Turbopack
  serverExternalPackages: ['pg', 'pg-native', '@prisma/adapter-pg', '@anthropic-ai/sdk', 'web-push'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    localPatterns: [
      { pathname: '/api/images/**', search: '**' },
      { pathname: '/logo.png' },
      { pathname: '/icon.png' },
      { pathname: '/images/**' },
    ],
    unoptimized: false,
  },
};

export default withNextIntl(nextConfig);
