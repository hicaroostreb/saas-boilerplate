'use client';

import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

export interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'ghost' | 'template';
}

/**
 * ThemeToggle component - Toggle between light and dark themes
 * Replicates the exact styling from the reference HTML
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
  variant = 'template',
}: ThemeToggleProps): JSX.Element {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <ThemeToggleSkeleton
        size={size}
        variant={variant}
        className={className}
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        // Base styles - EXATO DA REFERÊNCIA HTML
        'inline-flex items-center justify-center text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        'border border-input hover:bg-accent hover:text-accent-foreground',
        'bg-background rounded-xl border-none shadow-none',

        // Size variants - USANDO SIZE-X DA REFERÊNCIA
        {
          'size-8': size === 'sm',
          'size-9': size === 'md', // size-9 como na referência
          'size-10': size === 'lg',
        },

        // Variant overrides
        {
          // outline já está nas classes base
          'border-none shadow-none': variant === 'outline',
          'border-none shadow-none hover:bg-accent hover:text-accent-foreground':
            variant === 'ghost',
        },

        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {/* Sun Icon - CLASSES EXATAS DA REFERÊNCIA */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          'lucide lucide-sun transition-all',
          {
            'size-4': size === 'sm',
            'size-5': size === 'md', // size-5 da referência
            'size-6': size === 'lg',
          },
          // Estados dark/light da referência
          isDark
            ? '-rotate-90 scale-0' // dark:-rotate-90 dark:scale-0
            : 'rotate-0 scale-100'
        )}
        aria-hidden="true"
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

      {/* Moon Icon - CLASSES EXATAS DA REFERÊNCIA */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          'lucide lucide-moon absolute transition-all',
          {
            'size-4': size === 'sm',
            'size-5': size === 'md', // size-5 da referência
            'size-6': size === 'lg',
          },
          // Estados invertidos para dark theme
          isDark
            ? 'rotate-0 scale-100' // dark:rotate-0 dark:scale-100
            : 'rotate-90 scale-0'
        )}
        aria-hidden="true"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>

      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

// Loading skeleton - ATUALIZADO PARA COMBINAR COM A REFERÊNCIA
function ThemeToggleSkeleton({
  size,
  variant,
  className,
}: {
  size: 'sm' | 'md' | 'lg';
  variant: 'outline' | 'ghost' | 'template';
  className?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center animate-pulse',
        'bg-background rounded-xl border-none shadow-none',
        {
          'size-8': size === 'sm',
          'size-9': size === 'md',
          'size-10': size === 'lg',
        },
        {
          'border border-input': variant === 'outline',
        },
        className
      )}
      aria-hidden="true"
    >
      <div className="size-4 bg-muted-foreground/20 rounded" />
    </div>
  );
}
