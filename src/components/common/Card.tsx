import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'raised' | 'flat' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'none',
  hover = false,
  glass = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-surface border border-border/60 shadow-soft',
    raised: 'bg-surface-raised border border-border shadow-soft',
    flat: 'bg-surface border border-transparent',
    outline: 'bg-transparent border border-border'
  }[variant];

  const paddingStyles = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }[padding];

  return (
    <div
      className={`rounded-card ${
        glass ? 'glass-sheet border border-border/50' : variantStyles
      } ${paddingStyles} ${
        hover
          ? 'transition-apple hover:-translate-y-0.5 hover:border-border hover:shadow-md cursor-pointer'
          : 'transition-apple'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
