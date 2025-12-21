import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  height?: number;
  width?: number;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  className,
  height = 40,
  width = 40,
  showText = false,
}) => {
  return (
    <Link href="/" className={cn('flex items-center gap-3', className)}>
      <Image
        src="/logo.png"
        alt="Yubbox Logo"
        width={width}
        height={height}
        className="object-contain"
        style={{ width: 'auto', height: 'auto' }}
        priority
      />
      {showText && (
        <span className="text-2xl font-bold text-gray-900">Yubbox</span>
      )}
    </Link>
  );
};

export default Logo;

