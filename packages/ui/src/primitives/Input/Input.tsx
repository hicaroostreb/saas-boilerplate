'use client';

import * as React from 'react';
import { cn, focusRing } from '../../utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

/**
 * Input component - Base form input element
 *
 * @example
 * ```
 * function Examples() {
 *   return (
 *     <>
 *       <Input placeholder="Enter text..." />
 *       <Input type="email" error={true} />
 *       <Input disabled placeholder="Disabled input" />
 *     </>
 *   );
 * }
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground',

          // Focus styles
          focusRing(),
          'focus-visible:border-ring',

          // Disabled styles
          'disabled:cursor-not-allowed disabled:opacity-50',

          // Error styles
          error && 'border-error focus-visible:ring-error',

          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
