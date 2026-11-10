import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-sm mx-auto animate-apple-fade-in">
      <div className="w-12 h-12 rounded-card bg-surface flex items-center justify-center text-text-muted mb-3 border border-border/40">
        {icon}
      </div>
      <h3 className="text-body font-semibold text-text">
        {title}
      </h3>
      <p className="mt-1 text-small text-text-muted leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} variant="primary" size="md">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
