import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  glass = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 dark:border-slate-800/80 ${
        glass
          ? 'glass-card'
          : 'bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)]'
      } ${
        hover
          ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
