'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n-context';
import { cn } from '@/lib/utils';
import { Globe, BarChart3, DollarSign, ExternalLink } from 'lucide-react';

interface FooterProps { className?: string; variant?: 'simple' | 'full' }

interface SocialLink { id: string; label: string; url: string; symbol: string; }

const Footer: React.FC<FooterProps> = ({ className, variant = 'full' }) => {
  const { t } = useI18n();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetch('/api/social-links')
      .then(r => r.json())
      .then(d => { if (d.success) setSocialLinks(d.data); })
      .catch(() => {});
  }, []);

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

        {/* Brand tagline strip */}
        <div className="rounded-2xl px-6 py-5 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, #3d0730 0%, #790e61 55%, #c41e8a 100%)' }}>
          <div className="flex flex-col sm:flex-row items-center gap-5 text-white">
            <Image src="/icon.png" alt="Yubbox" width={36} height={36} className="object-contain brightness-0 invert" />
            <div className="text-center sm:text-left">
              <p className="font-black text-white text-sm">{t('footer.tagline')}</p>
              <p className="text-white/60 text-xs mt-0.5">{t('footer.taglineSub')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold">
              <Globe className="w-3 h-3" /> {t('footer.badgeCountries')}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold">
              <BarChart3 className="w-3 h-3" /> {t('footer.badgeAnalytics')}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold">
              <DollarSign className="w-3 h-3" /> {t('footer.badgePrice')}
            </div>
          </div>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">{t('footer.colPlatform')}</h4>
            <ul className="flex flex-col gap-2.5">
              {([
                { labelKey: 'footer.linkBrowse',    href: '/' },
                { labelKey: 'footer.linkTrending',  href: '/?type=trending' },
                { labelKey: 'footer.linkProducts',  href: '/?type=product' },
                { labelKey: 'footer.linkServices',  href: '/?type=service' },
              ] as const).map(({ labelKey, href }) => (
                <li key={labelKey}>
                  <Link href={href} className="text-sm text-neutral-600 hover:text-[#790e61] transition-colors">
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Advertise */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">{t('footer.colAdvertise')}</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/ads/create" className="text-sm font-semibold hover:opacity-80 transition-opacity" style={{ color: '#790e61' }}>
                  {t('footer.linkCreateYubbox')}
                </Link>
              </li>
              {([
                { labelKey: 'footer.linkDashboard', href: '/dashboard' },
                { labelKey: 'footer.linkTopLens',   href: '/ads/create' },
                { labelKey: 'footer.linkStories',   href: '/ads/create' },
                { labelKey: 'footer.linkPricing',   href: '/pricing' },
              ] as const).map(({ labelKey, href }) => (
                <li key={labelKey}>
                  <Link href={href} className="text-sm text-neutral-600 hover:text-[#790e61] transition-colors">
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">{t('footer.colAccount')}</h4>
            <ul className="flex flex-col gap-2.5">
              {([
                { labelKey: 'footer.linkGetStarted',  href: '/register' },
                { labelKey: 'footer.linkSignIn',      href: '/login' },
                { labelKey: 'footer.linkMyDashboard', href: '/dashboard' },
              ] as const).map(({ labelKey, href }) => (
                <li key={labelKey}>
                  <Link href={href} className="text-sm text-neutral-600 hover:text-[#790e61] transition-colors">
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">{t('footer.colCompany')}</h4>
            <ul className="flex flex-col gap-2.5">
              {([
                { labelKey: 'footer.linkAbout',      href: '/about' },
                { labelKey: 'footer.linkHowItWorks', href: '/how-it-works' },
                { labelKey: 'footer.linkSupport',    href: '/support' },
                { labelKey: 'footer.linkContact',    href: '/contact' },
              ] as const).map(({ labelKey, href }) => (
                <li key={labelKey}>
                  <Link href={href} className="text-sm text-neutral-600 hover:text-[#790e61] transition-colors inline-flex items-center gap-1">
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>

            {socialLinks.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">{t('footer.followUs')}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {socialLinks.map(({ id, label, url, symbol }) => (
                    <a key={id} href={url} aria-label={label} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-[#790e61] hover:text-[#790e61] transition-colors text-xs font-bold">
                      {symbol}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-400">{t('common.footerBranding') || t('common.copyright')}</p>
          <div className="flex items-center gap-3 text-[10px] text-neutral-300 font-medium">
            <span>{t('footer.bottomSsl')}</span>
            <span>·</span>
            <span>{t('footer.bottomCountries')}</span>
            <span>·</span>
            <span>{t('footer.bottomData')}</span>
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
