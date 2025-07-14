import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-c-text-secondary pointer-events-none flex items-center">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border border-c-border bg-c-card py-2 px-3 text-c-text placeholder-c-text-secondary focus:outline-none focus:ring-2 focus:ring-c-accent focus:border-c-accent transition-colors',
            icon ? 'pl-10' : '',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input'; 