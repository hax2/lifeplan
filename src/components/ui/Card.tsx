import { cn } from '@/lib/utils';

export const Card = ({
  children,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) => (
  <Tag
    className={cn(
      'rounded-2xl border bg-skin-card shadow-sm',
      'border-skin-border text-skin-text',
      'p-6 sm:p-8',
      className
    )}
  >
    {children}
  </Tag>
);
