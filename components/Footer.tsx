'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n-context';
import { cn } from '@/lib/utils';
import { Globe, BarChart3, DollarSign, ExternalLink } from 'lucide-react';

interface FooterProps {
  className?: string;
  variant?: 'simple' | 'full';
}

const SOCIAL_LINKS = [
  { label: 'X', href: '#', symbol: '𝕏' },
  { label: 'Instagram', href: '#', symbol: 'IG' },
  { label: 'LinkedIn', href: '#', symbol: 'in' },
  { label: 'Facebook', href: '#', symbol: 'f' },
];

const Footer: React.FC<FooterProps> = ({ className, variant = 'full' }) => {
  const { t } = useI18n();

  if (variant === 'simple') {
    return (
      <p className={cn('text-center text-xs text-gray-400 mt-6', className)}>
        {t('common.copyright')}
      </p>
    );
  }

  return (
    <footer className={cn('border-t border-neutral-100 bg-white/60 backdrop-blur-sm', className)}>
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">

        {/* Top: brand tagline strip */}
        <div
          className="rounded-2xl px-6 py-5 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, #3d0730 0%, #790e61 55%, #c41e8a 100%)' }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-5 text-white">
            <Image src="/icon.png" alt="Yubbox" width={36} height={36} className="object-contain brightness-0 invert" />
            <div className="text-center sm:text-left">
              <p className="font-black text-white text-sm">Yubbox your products &amp; services to the world.</p>
              <p className="text-white/60 text-xs mt-0.5">Every ad is a Yubbox. Data-driven. From $1.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold">
              <Globe className="w-3 h-3" /> 150+ Countries
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold">
              <BarChart3 className="w-3 h-3" /> Live Analytics
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold">
              <DollarSign className="w-3 h-3" /> From $1
            </div>
          </div>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Col 1: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Platform</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'Browse Yubboxes', href: '/' },
                { label: 'Trending', href: '/?type=trending' },
                { label: 'Products', href: '/?type=product' },
                { label: 'Services', href: '/?type=service' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-neutral-600 hover:text-[#790e61] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2: Advertise */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Advertise</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/ads/create" className="text-sm font-semibold hover:opacity-80 transition-opacity" style={{ color: '#790e61' }}>
                  + Create a Yubbox
                </Link>
              </li>
              {[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Top Lens Placement', href: '/ads/create' },
                { label: 'Stories Ads', href: '/ads/create' },
                { label: 'Pricing', href: '/ads/create' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-neutral-600 hover:text-[#790e61] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Account */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Account</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'Get Started', href: '/register' },
                { label: 'Sign In', href: '/login' },
                { label: 'My Dashboard', href: '/dashboard' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-neutral-600 hover:text-[#790e61] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Company</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'About Yubbox', href: '/' },
                { label: 'How It Works', href: '/' },
                { label: 'Help & Support', href: '/' },
                { label: 'Contact Us', href: '/' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-neutral-600 hover:text-[#790e61] transition-colors inline-flex items-center gap-1">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social links */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Follow Us</p>
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map(({ label, href, symbol }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-[#790e61] hover:text-[#790e61] transition-colors text-xs font-bold"
                  >
                    {symbol}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-400">
            {t('common.footerBranding') || t('common.copyright')}
          </p>

          <div className="flex items-center gap-3 text-[10px] text-neutral-300 font-medium">
            <span>🔒 SSL Secured</span>
            <span>·</span>
            <span>🌍 150+ Countries</span>
            <span>·</span>
            <span>📊 Data-Driven</span>
          </div>

          <p className="text-xs text-neutral-300 font-medium tracking-wider uppercase flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            {t('common.footerTagline')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
