'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { Input, type InputProps } from '../Input';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showToggle?: boolean;
  helperText?: string; // ✅ ADICIONAR
}

/**
 * PasswordInput component - Password input with visibility toggle
 *
 * @example
 * ```
 * function PasswordForm() {
 *   return (
 *     <>
 *       <PasswordInput
 *         placeholder="Enter password"
 *         showToggle={true}
 *       />
 *
 *       <PasswordInput
 *         placeholder="Confirm password"
 *         showToggle={false}
 *         error={true}
 *         helperText="Password confirmation required"
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, showToggle = true, helperText, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={cn(showToggle && 'pr-10', className)}
        />

        {showToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground transition-colors"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>

      {/* ✅ ADICIONAR helperText */}
      {helperText && (
        <p
          className={cn(
            'text-xs',
            props.error ? 'text-error' : 'text-muted-foreground'
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

// Icons
function EyeIcon(): JSX.Element {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(): JSX.Element {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="m1 1 22 22" />
    </svg>
  );
}
