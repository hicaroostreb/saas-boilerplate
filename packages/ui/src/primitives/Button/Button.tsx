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
  base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline:
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-error text-error-foreground hover:bg-error/90',
    },
    size: {
      sm: 'h-9 px-3',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8',
      icon: 'h-10 w-10',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

/**
 * Button component - Core interactive element
 *
 * @example
 * ```
 * function Examples() {
 *   return (
 *     <>
 *       <Button variant="primary" size="md">
 *         Primary Button
 *       </Button>
 *
 *       <Button variant="outline" loading>
 *         Loading Button
 *       </Button>
 *
 *       <Button variant="destructive" size="sm">
 *         Delete
 *       </Button>
 *     </>
 *   );
 * }
 * ```
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
    const isButtonDisabled = Boolean(isDisabled ?? loading);

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
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Loading spinner
function Spinner({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={cn('animate-spin', className)}
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
  );
}
