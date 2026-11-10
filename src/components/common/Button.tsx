import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'forest' | 'ocean' | 'sand';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  // Apple Minimal: rounded-pill, 44px touch targets on mobile, soft ease-out transitions
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-pill transition-apple focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer shrink-0';

  const sizeClasses = {
    sm: 'text-caption px-3.5 py-1.5 gap-1.5 min-h-[32px]',
    md: 'text-small px-5 py-2.5 gap-2 min-h-[44px]',
    lg: 'text-body px-6 py-3 gap-2.5 min-h-[48px]'
  }[size];

  const variantClasses = {
    // Apple Primary: Solid Accent with high contrast text
    primary:
      'bg-accent text-accent-contrast hover:bg-accent-hover shadow-soft',
    // Apple Secondary: Subtle surface fill
    secondary:
      'bg-surface hover:bg-surface-raised text-text border border-border/60',
    // Apple Outline: Crisp subtle border
    outline:
      'border border-border text-text hover:bg-surface',
    // Apple Ghost: Clean text button
    ghost:
      'text-text-muted hover:text-text hover:bg-surface/70',
    // Status Danger
    danger:
      'bg-danger text-white hover:opacity-90',
    // Semantic mappings (backward compatible with existing code)
    success:
      'bg-success text-white hover:opacity-90',
    forest:
      'bg-accent text-accent-contrast hover:bg-accent-hover shadow-soft',
    ocean:
      'bg-accent text-accent-contrast hover:bg-accent-hover shadow-soft',
    sand:
      'bg-accent text-accent-contrast hover:bg-accent-hover shadow-soft'
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
