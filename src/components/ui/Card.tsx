import { cn } from '@/lib/utils';

type Variant = 'default' | 'flat';

export const Card = ({
  children,
  className,
  as: Tag = 'div',
  variant = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  variant?: Variant;
}) => {
  const styles =
    variant === 'flat'
      ? 'p-0 bg-transparent border-none shadow-none'
      : 'rounded-2xl border bg-skin-card shadow-sm p-6 sm:p-8';

  return (
    <Tag className={cn(styles, 'text-skin-text', className)}>
      {children}
    </Tag>
  );
};
