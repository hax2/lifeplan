import { cn } from '@/lib/utils';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors';
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
  };
  const variants = {
    primary: 'bg-skin-accent text-white hover:brightness-110',
    outline:
      'border border-skin-border text-skin-text hover:bg-skin-card/60 dark:hover:bg-zinc-800',
    ghost:
      'text-skin-text/70 hover:bg-skin-border/20 dark:hover:bg-zinc-800/40',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 ring-red-500',
  };

  return (
    <button
      {...rest}
      className={cn(base, sizes[size], variants[variant], className)}
    >
      {children}
    </button>
  );
} 