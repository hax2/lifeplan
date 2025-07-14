import * as RadixDialog from '@radix-ui/react-dialog';
import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title?: string;
  description?: string;
  children: ReactNode;
  showClose?: boolean;
}

export function Dialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  showClose = true,
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <RadixDialog.Content
          className={cn(
            'fixed z-50 left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-skin-bg p-6 shadow-2xl focus:outline-none',
            'animate-dialog-in'
          )}
        >
          {showClose && (
            <RadixDialog.Close asChild>
              <button
                className="absolute right-4 top-4 rounded-full p-1 text-skin-text/60 hover:text-skin-text focus:outline-none focus:ring-2 focus:ring-skin-accent"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </RadixDialog.Close>
          )}
          {title && (
            <RadixDialog.Title className="mb-1 text-lg font-bold text-skin-text">
              {title}
            </RadixDialog.Title>
          )}
          {description && (
            <RadixDialog.Description className="mb-4 text-skin-text/70 text-sm">
              {description}
            </RadixDialog.Description>
          )}
          <div>{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
} 