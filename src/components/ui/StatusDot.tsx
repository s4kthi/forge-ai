import React from 'react';
import { cn } from '../../lib/utils';

export interface StatusDotProps {
  status?: 'active' | 'busy' | 'idle' | 'warning' | 'error' | 'offline';
  pulse?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status = 'active',
  pulse = true,
  className,
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const statusStyles = {
    active: {
      color: 'bg-emerald-400',
      glow: 'bg-emerald-400',
    },
    busy: {
      color: 'bg-violet-400',
      glow: 'bg-violet-400',
    },
    idle: {
      color: 'bg-zinc-500',
      glow: 'bg-zinc-500',
    },
    warning: {
      color: 'bg-amber-400',
      glow: 'bg-amber-400',
    },
    error: {
      color: 'bg-rose-400',
      glow: 'bg-rose-400',
    },
    offline: {
      color: 'bg-zinc-600',
      glow: 'bg-zinc-600',
    },
  };

  const current = statusStyles[status] || statusStyles.idle;

  return (
    <span className={cn('relative inline-flex items-center justify-center flex-shrink-0', className)}>
      {pulse && (status === 'active' || status === 'busy' || status === 'warning') && (
        <span
          className={cn(
            'absolute inline-flex rounded-full opacity-75 animate-radar',
            sizeMap[size],
            current.glow
          )}
        />
      )}
      <span className={cn('relative inline-flex rounded-full', sizeMap[size], current.color)} />
    </span>
  );
};
