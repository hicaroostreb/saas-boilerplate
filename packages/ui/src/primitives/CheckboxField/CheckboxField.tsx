'use client';

import * as React from 'react';
import { cn } from '../../utils/cn';

export interface CheckboxFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  helperText?: string;
  error?: boolean;
}

export const CheckboxField = React.forwardRef<
  HTMLInputElement,
  CheckboxFieldProps
>(({ className, label, helperText, error, id, ...props }, ref) => {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id={fieldId}
          ref={ref}
          className={cn(
            'mt-1 size-4 rounded border bg-background ring-offset-background',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-input',
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={fieldId}
            className={cn(
              'text-sm leading-relaxed cursor-pointer',
              error ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {label}
          </label>
        )}
      </div>
      {helperText && (
        <p
          className={cn(
            'text-sm ml-6',
            error ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

CheckboxField.displayName = 'CheckboxField';
