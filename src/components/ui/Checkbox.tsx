import React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
        <span className="relative">
          <input
            type="checkbox"
            ref={ref}
            className={cn(
              'peer appearance-none w-5 h-5 rounded border border-c-border bg-c-card checked:bg-c-accent checked:border-c-accent transition-colors focus:ring-2 focus:ring-c-accent',
              className
            )}
            {...props}
          />
          <span className="pointer-events-none absolute left-0 top-0 w-5 h-5 flex items-center justify-center">
            <svg
              className="opacity-0 peer-checked:opacity-100 text-white"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 10.5L9 14.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
        {label && <span className="text-c-text text-base">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox'; 