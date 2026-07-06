import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
}

export function Card({ children, hover, glow, className, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded bg-bg-card border border-bg-hover p-5 shadow-card',
        hover && 'transition-all duration-200 hover:border-accent-blue/40 hover:shadow-card-lg',
        glow && 'shadow-glow border-accent-purple/30',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: ReactNode;
}

export function Badge({ variant = 'default', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-bg-hover text-text-muted',
        variant === 'success' && 'bg-status-success/15 text-status-success',
        variant === 'warning' && 'bg-status-warning/15 text-status-warning',
        variant === 'danger' && 'bg-status-danger/15 text-status-danger',
        variant === 'info' && 'bg-accent-blue/15 text-accent-blue',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}