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
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97] hover:-translate-y-0.5 cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-5 py-2.5 gap-2 h-10',
    lg: 'text-base px-6 py-3 gap-2.5 h-12'
  }[size];

  const variantClasses = {
    // NomadKit Primary: Warm Sand (#D4A373)
    primary: 'bg-[#D4A373] hover:bg-[#C49160] active:bg-[#B37F4E] text-white shadow-sm hover:shadow-md hover:shadow-[#D4A373]/25 focus:ring-[#D4A373]',
    // NomadKit Secondary: Light warm sand card with deeper text
    secondary: 'bg-[#FAF6F0] hover:bg-[#F4ECE1] text-[#875C34] dark:bg-[#272420] dark:hover:bg-[#332E28] dark:text-[#E9D9C3] border border-[#E9D9C3]/70 dark:border-[#38332E] focus:ring-[#D4A373]',
    // NomadKit Outline: Warm border with gentle sand hover
    outline: 'border border-[#DEC6A5] dark:border-[#38332E] hover:bg-[#FAF6F0] dark:hover:bg-[#272420] text-[#875C34] dark:text-[#E9D9C3] focus:ring-[#D4A373]',
    // NomadKit Ghost
    ghost: 'hover:bg-[#FAF6F0] dark:hover:bg-[#272420] text-stone-700 dark:text-stone-300 focus:ring-[#D4A373]',
    // Error / Danger
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
    // NomadKit Tertiary Forest (#166534)
    success: 'bg-[#166534] hover:bg-[#14532D] text-white shadow-sm hover:shadow-md hover:shadow-[#166534]/25 focus:ring-[#166534]',
    forest: 'bg-[#166534] hover:bg-[#14532D] text-white shadow-sm hover:shadow-md hover:shadow-[#166534]/25 focus:ring-[#166534]',
    // NomadKit Ocean (#0891B2)
    ocean: 'bg-[#0891B2] hover:bg-[#0E7490] text-white shadow-sm hover:shadow-md hover:shadow-[#0891B2]/25 focus:ring-[#0891B2]',
    // Sand Explicit
    sand: 'bg-[#D4A373] hover:bg-[#C49160] text-white shadow-sm hover:shadow-md hover:shadow-[#D4A373]/25 focus:ring-[#D4A373]'
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
