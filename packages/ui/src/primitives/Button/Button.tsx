'use client';

import * as React from 'react';
import {
  cn,
  createVariants,
  disabled,
  focusRing,
  interactive,
} from '../../utils/cn';

const buttonVariants = createVariants({
  base: 'inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
      outline:
        'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-error text-error-foreground hover:bg-error/90',
    },
    size: {
      sm: 'h-9 px-4 py-2 rounded-xl',
      md: 'h-10 px-4 py-2 rounded-xl',
      lg: 'h-11 px-8 rounded-xl',
      icon: 'h-10 w-10 rounded-xl',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'sm',
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  asChild?: boolean;
}

/**
 * Button component - Single Responsibility: Render button with variants
 *
 * Follows SOLID principles:
 * - SRP: Only handles button rendering and styling
 * - OCP: Extensible via variants without modification
 * - LSP: All variants can substitute base button
 * - ISP: Minimal interface, only necessary props
 * - DIP: Depends on style abstractions, not concrete implementations
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      disabled: isDisabled,
      children,
      ...props
    },
    ref
  ) => {
    const isButtonDisabled = Boolean(isDisabled || loading);

    return (
      <button
        className={cn(
          buttonVariants({ variant, size }),
          interactive(),
          focusRing(),
          disabled(isButtonDisabled),
          className
        )}
        ref={ref}
        disabled={isButtonDisabled}
        {...props}
      >
        {loading && <ButtonSpinner />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// SRP: Separate component for loading state
const ButtonSpinner = React.memo(() => (
  <svg
    className="mr-2 h-4 w-4 animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
));

ButtonSpinner.displayName = 'ButtonSpinner';
