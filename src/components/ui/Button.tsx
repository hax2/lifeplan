import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-c-accent gap-2';
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  const variants = {
    primary: 'bg-c-accent text-white hover:brightness-110',
    secondary: 'border border-c-border text-c-text bg-c-card hover:bg-c-bg/60',
    ghost: 'text-c-text-secondary hover:bg-c-border/20',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 ring-red-500',
  };
  return (
    <button
      type="button"
      className={cn(base, sizes[size], variants[variant], className)}
      disabled={isLoading || disabled}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="animate-spin h-5 w-5" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
} 