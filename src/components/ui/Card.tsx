import { type FC, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 dark:bg-slate-800 dark:border-slate-700', className)}>
    {children}
  </div>
);
