import { cn } from '@/lib/utils';

export const Skeleton = ({ className = 'h-4' }) => (
  <div
    className={cn(
      'animate-pulse rounded-md',
      'bg-slate-200/60 dark:bg-zinc-600/30',
      className
    )}
  />
); 