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
      className={`rounded-2xl border border-[#EFEBE4] dark:border-[#332E28] ${
        glass
          ? 'glass-card'
          : 'bg-[#FFFFFF] dark:bg-[#1F1D1A] shadow-[0_2px_16px_rgba(212,163,115,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
      } ${
        hover
          ? 'nomad-card-hover hover:border-[#D4A373]/40 dark:hover:border-[#D4A373]/30 cursor-pointer'
          : ''
      } transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
