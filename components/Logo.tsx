import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n-context';

interface LogoProps {
  className?: string;
  height?: number;
  width?: number;
  showText?: boolean;
  disableLink?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  className,
  height = 40,
  width = 40,
  showText = false,
  disableLink = false,
}) => {
  const { t } = useI18n();
  const content = (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src="/logo.png"
        alt={t('common.logoAlt') || "Yubbox Logo"}
        width={width}
        height={height}
        className="object-contain"
        style={{ width: 'auto', height: 'auto' }}
        priority
      />
      {showText && (
        <span className="text-2xl font-bold text-gray-900">Yubbox</span>
      )}
    </div>
  );

  if (disableLink) {
    return content;
  }

  return <Link href="/">{content}</Link>;
};

export default Logo;

