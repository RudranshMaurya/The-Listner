import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import type { ListenerStatus } from '../../types';

export interface BadgeProps {
  variant?: 'idle' | 'busy' | 'listening' | 'verified' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
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
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const variantStyles = {
    idle: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    busy: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    listening: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
    verified: 'bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300'
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClass} ${variantStyles} ${className}`}
    >
      {variant === 'idle' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      )}
      {variant === 'busy' && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      )}
      {variant === 'listening' && (
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
      )}
      {variant === 'verified' && (
        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
      )}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ListenerStatus }> = ({ status }) => {
  const labels: Record<ListenerStatus, string> = {
    idle: 'Available Now',
    busy: 'Busy',
    listening: 'In Conversation'
  };

  return <Badge variant={status}>{labels[status] || status}</Badge>;
};
