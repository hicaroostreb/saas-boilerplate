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
  rightElement?: React.ReactNode;
  forgotPasswordLink?: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      organizationContext,
      icon,
      rightElement,
      forgotPasswordLink,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const fieldId = id ?? generatedId;

    return (
      <div className={cn('space-y-2 flex flex-col', className)}>
        {/* Label with Forgot Password */}
        {label && (
          <div className="flex flex-row items-center justify-between">
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
            {forgotPasswordLink && (
              <a
                className="ml-auto inline-block text-sm underline"
                href={forgotPasswordLink}
              >
                Forgot password?
              </a>
            )}
          </div>
        )}

        {/* Input with icon */}
        <div className="relative inline-block h-9 w-full">
          {icon && (
            <span className="absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
              {icon}
            </span>
          )}
          <Input
            id={fieldId}
            ref={ref}
            className={cn(
              icon && 'pl-10',
              rightElement && 'pr-10',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            error={Boolean(error)}
            {...props}
          />
          {rightElement && (
            <span className="absolute left-auto right-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
              {rightElement}
            </span>
          )}
        </div>

        {/* Helper text */}
        {helperText && (
          <p
            className={cn(
              'text-sm',
              error ? 'text-destructive' : 'text-muted-foreground'
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
