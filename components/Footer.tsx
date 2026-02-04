'use client';

import React from 'react';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n-context';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
  variant?: 'simple' | 'full';
}

const Footer: React.FC<FooterProps> = ({ className, variant = 'full' }) => {
  const { t } = useI18n();

  if (variant === 'simple') {
    return (
      <p className={cn("text-center text-xs text-gray-400 mt-6", className)}>
        {t('common.copyright')}
      </p>
    );
  }

  return (
    <footer className={cn("py-20 border-t border-neutral-100", className)}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-4">
          <Image 
            src="/icon.png" 
            alt="Yubbox" 
            width={50} 
            height={50} 
            className="object-contain"
          />
        </div>
        <p className="text-sm text-neutral-400 font-medium">
          {t('common.footerBranding') || t('common.copyright')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
