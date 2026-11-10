import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { ListenerStatus } from '../../types';

export interface BadgeProps {
  variant?: 'idle' | 'busy' | 'listening' | 'offline' | 'verified' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
  size = 'md'
}) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-caption font-medium';

  const dotColors = {
    idle: 'bg-success',
    verified: 'bg-success',
    success: 'bg-success',
    busy: 'bg-warning',
    warning: 'bg-warning',
    listening: 'bg-accent',
    info: 'bg-accent',
    danger: 'bg-danger',
    offline: 'bg-text-muted',
    neutral: 'bg-text-muted'
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill bg-surface text-text border border-border/50 transition-apple ${sizeClass} ${className}`}
    >
      {variant === 'verified' ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors} ${variant === 'idle' ? 'animate-pulse' : ''}`} />
      )}
      <span>{children}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ListenerStatus }> = ({ status }) => {
  const labels: Record<ListenerStatus, string> = {
    idle: 'Available Now',
    busy: 'Busy',
    listening: 'In Conversation',
    offline: 'Offline'
  };

  return <Badge variant={status}>{labels[status] || status}</Badge>;
};
