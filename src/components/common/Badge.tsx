import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
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
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const variantStyles = {
    // Forest for idle/ready
    idle: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0] dark:bg-[#142B1A] dark:text-[#86EFAC] dark:border-[#1E4D2B]',
    busy: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    // Sand for listening
    listening: 'bg-[#FAF6F0] text-[#875C34] border-[#DEC6A5] dark:bg-[#272420] dark:text-[#E9D9C3] dark:border-[#38332E]',
    offline: 'bg-stone-100 text-stone-500 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700',
    // Forest for verified
    verified: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0] dark:bg-[#142B1A] dark:text-[#86EFAC] dark:border-[#1E4D2B]',
    success: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0] dark:bg-[#142B1A] dark:text-[#86EFAC]',
    warning: 'bg-[#FEFCE8] text-[#CA8A04] border-[#FEF08A] dark:bg-[#2B230B] dark:text-[#FDE047]',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300',
    neutral: 'bg-[#F7F4EE] text-stone-700 border-[#E7E2D8] dark:bg-[#272420] dark:text-stone-300 dark:border-[#38332E]',
    // Ocean for info
    info: 'bg-[#ECFEFF] text-[#0891B2] border-[#A5F3FC] dark:bg-[#082F38] dark:text-[#67E8F9] dark:border-[#0E7490]'
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all duration-200 ${sizeClass} ${variantStyles} ${className}`}
    >
      {variant === 'idle' && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#166534] animate-pulse" />
      )}
      {variant === 'busy' && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#CA8A04]" />
      )}
      {variant === 'listening' && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373] animate-ping" />
      )}
      {variant === 'offline' && (
        <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
      )}
      {variant === 'verified' && (
        <CheckCircle2 className="w-3.5 h-3.5 text-[#166534] dark:text-[#86EFAC] shrink-0" />
      )}
      {children}
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
