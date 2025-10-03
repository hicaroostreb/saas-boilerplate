'use client';

import * as React from 'react';
import { cn } from '../../utils/cn';
import { Input, type InputProps } from '../Input';

export interface FormFieldProps extends Omit<InputProps, 'error'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  organizationContext?: string;
  icon?: React.ReactNode;
}

/**
 * FormField component - Input with label, validation, and help text
 *
 * @example
 * ```
 * function LoginForm() {
 *   return (
 *     <form>
 *       <FormField
 *         label="Email"
 *         type="email"
 *         placeholder="Enter your email"
 *         helperText="We'll never share your email"
 *         icon={<EmailIcon />}
 *       />
 *
 *       <FormField
 *         label="Password"
 *         type="password"
 *         error={true}
 *         helperText="Password must be at least 8 characters"
 *       />
 *     </form>
 *   );
 * }
 * ```
 */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      organizationContext,
      icon,
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = helperText ? `${fieldId}-helper` : undefined;

    return (
      <div className={cn('space-y-2', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={fieldId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {organizationContext && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({organizationContext})
              </span>
            )}
          </label>
        )}

        {/* Input with icon */}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <Input
            id={fieldId}
            ref={ref}
            className={cn(
              icon && 'pl-10',
              error && 'border-error focus-visible:ring-error'
            )}
            aria-describedby={helperId}
            error={Boolean(error)}
            {...props}
          />
        </div>

        {/* Helper text */}
        {helperText && (
          <p
            id={helperId}
            className={cn(
              'text-xs',
              error ? 'text-error' : 'text-muted-foreground'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
