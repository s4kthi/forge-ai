import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'sm', children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none select-none rounded-lg text-xs';

    const variants = {
      primary:
        'bg-primary hover:bg-primary-hover text-white shadow-sm border border-transparent active:scale-[0.99]',
      secondary:
        'bg-white hover:bg-slate-50 text-charcoal-800 border border-border shadow-subtle active:scale-[0.99]',
      ghost:
        'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100 border border-transparent',
      outline:
        'border border-border text-charcoal-700 hover:bg-slate-50 hover:text-charcoal-900',
      danger:
        'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 active:scale-[0.99]',
    };

    const sizes = {
      xs: 'h-6 px-2 text-[11px] gap-1 rounded',
      sm: 'h-8 px-3 gap-1.5',
      md: 'h-9 px-3.5 gap-2 text-xs',
      lg: 'h-10 px-4 gap-2 text-sm',
      icon: 'h-8 w-8 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
