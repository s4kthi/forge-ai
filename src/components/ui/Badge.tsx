import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'outline' | 'subtle';
  size?: 'xs' | 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'xs',
  children,
  ...props
}) => {
  const sizeClasses = {
    xs: 'text-[11px] px-2 py-0.5 font-medium',
    sm: 'text-xs px-2.5 py-0.5 font-medium',
    md: 'text-xs px-3 py-1 font-medium',
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    violet: 'bg-purple-50 text-purple-700 border border-purple-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200',
    outline: 'border border-slate-300 text-slate-700 bg-white',
    subtle: 'bg-slate-50 text-slate-600 border border-slate-200/60',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-sans leading-none',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
