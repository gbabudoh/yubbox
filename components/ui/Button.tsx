import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n-context';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'logo';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const { t } = useI18n();

  const base =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus:ring-4 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.97]';

  const variants: Record<string, string> = {
    primary:   'bg-[#790e61] hover:bg-[#9d1b7f] text-white focus:ring-[#790e61]/20 shadow-sm',
    secondary: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 focus:ring-neutral-200',
    outline:   'border border-neutral-200 text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-100',
    ghost:     'text-neutral-600 hover:bg-neutral-100 focus:ring-neutral-100',
    logo:      'text-white focus:ring-[#790e61]/20 shadow-lg',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const logoStyle = variant === 'logo'
    ? { background: 'linear-gradient(135deg, #790e61, #c41e8a)' }
    : {};

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      style={logoStyle}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="animate-spin -ml-1 mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent" />
          {t('common.loading')}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
