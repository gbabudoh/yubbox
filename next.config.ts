import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/images/**',
        search: '**',
      },
      {
        pathname: '/logo.png',
      },
      {
        pathname: '/icon.png',
      },
      {
        pathname: '/images/**',
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
