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
      className={`rounded-card border border-border/50 ${
        glass
          ? 'glass-sheet'
          : 'bg-surface shadow-soft'
      } ${
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
