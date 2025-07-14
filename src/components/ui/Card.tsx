import { cn } from '@/lib/utils';
import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const Card = ({
  children,
  className,
  as: Tag = 'div',
}: CardProps) => {
  return (
    <Tag
      className={cn(
        'rounded-xl border bg-[var(--c-card)] border-[var(--c-border)] shadow-sm p-6',
        className
      )}
    >
      {children}
    </Tag>
  );
};
