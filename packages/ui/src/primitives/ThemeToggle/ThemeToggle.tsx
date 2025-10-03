'use client';

import { useTheme } from '../../hooks/useTheme';
import { cn, focusRing, interactive } from '../../utils/cn';

export interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'ghost';
}

/**
 * ThemeToggle component - Toggle between light and dark themes
 *
 * @example
 * ```
 * function Header() {
 *   return (
 *     <div className="flex items-center gap-4">
 *       <h1>My App</h1>
 *       <ThemeToggle size="md" variant="outline" />
 *     </div>
 *   );
 * }
 * ```
 */
export function ThemeToggle({
  className,
  size = 'md',
  variant = 'outline',
}: ThemeToggleProps): JSX.Element {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <ThemeToggleSkeleton
        size={size}
        variant={variant}
        className={className || undefined}
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        // Base styles
        'relative inline-flex items-center justify-center font-medium transition-colors',
        interactive(),
        focusRing(),
        'disabled:pointer-events-none disabled:opacity-50',

        // Size variants
        {
          'h-8 w-8': size === 'sm',
          'h-9 w-9': size === 'md',
          'h-10 w-10': size === 'lg',
        },

        // Style variants
        {
          'border border-input bg-background shadow-sm hover:bg-accent':
            variant === 'outline',
          'hover:bg-accent': variant === 'ghost',
        },

        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {/* Sun Icon */}
      <SunIcon
        className={cn(
          'transition-all duration-300 ease-in-out',
          {
            'h-4 w-4': size === 'sm',
            'h-5 w-5': size === 'md',
            'h-6 w-6': size === 'lg',
          },
          isDark
            ? '-rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100'
        )}
      />

      {/* Moon Icon */}
      <MoonIcon
        className={cn(
          'absolute transition-all duration-300 ease-in-out',
          {
            'h-4 w-4': size === 'sm',
            'h-5 w-5': size === 'md',
            'h-6 w-6': size === 'lg',
          },
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0'
        )}
      />
    </button>
  );
}

// Loading skeleton
function ThemeToggleSkeleton({
  size,
  variant,
  className,
}: {
  size: 'sm' | 'md' | 'lg';
  variant: 'outline' | 'ghost';
  className?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center animate-pulse bg-muted',
        {
          'h-8 w-8': size === 'sm',
          'h-9 w-9': size === 'md',
          'h-10 w-10': size === 'lg',
        },
        {
          'border border-input shadow-sm': variant === 'outline',
        },
        className
      )}
      aria-hidden="true"
    >
      <div className="h-4 w-4 bg-muted-foreground/20 rounded" />
    </div>
  );
}

// Icons
function SunIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
