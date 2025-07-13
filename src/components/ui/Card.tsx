import { type FC, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 dark:bg-zinc-900 dark:border-zinc-800', className)}>
    {children}
  </div>
);
