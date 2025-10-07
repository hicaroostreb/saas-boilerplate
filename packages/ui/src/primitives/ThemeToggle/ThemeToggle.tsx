'use client';

import { useTheme } from '../../hooks/useTheme';
import { cn, createVariants, focusRing, interactive } from '../../utils/cn';

const themeToggleVariants = createVariants({
  base: 'inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative',
  variants: {
    variant: {
      outline:
        'border border-input hover:bg-accent hover:text-accent-foreground bg-background',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      template:
        'border border-input hover:bg-accent hover:text-accent-foreground bg-background rounded-xl border-none shadow-none',
    },
    size: {
      sm: 'h-8 w-8',
      md: 'size-9',
      lg: 'h-10 w-10',
    },
  },
  defaultVariants: {
    variant: 'template',
    size: 'md',
  },
});

export interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'ghost' | 'template';
}

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
        themeToggleVariants({ variant, size }),
        interactive(),
        focusRing(),
        'relative overflow-hidden',
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {/* Sun Icon - Mostrar apenas no light mode */}
      {!isDark && (
        <SunIcon
          className={cn('lucide lucide-sun transition-all duration-300', {
            'size-4': size === 'sm',
            'size-5': size === 'md',
            'size-6': size === 'lg',
          })}
          aria-hidden={true}
        />
      )}

      {/* Moon Icon - Mostrar apenas no dark mode */}
      {isDark && (
        <MoonIcon
          className={cn('lucide lucide-moon transition-all duration-300', {
            'size-4': size === 'sm',
            'size-5': size === 'md',
            'size-6': size === 'lg',
          })}
          aria-hidden={true}
        />
      )}

      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

// Resto do código igual...
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
        themeToggleVariants({ variant, size }),
        'animate-pulse bg-muted',
        className
      )}
      aria-hidden="true"
    >
      <div className="h-4 w-4 bg-muted-foreground/20 rounded" />
    </div>
  );
}

const SunIcon = ({
  className,
  ...props
}: {
  className?: string;
  'aria-hidden'?: boolean;
}) => (
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
    className={className}
    {...props}
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

const MoonIcon = ({
  className,
  ...props
}: {
  className?: string;
  'aria-hidden'?: boolean;
}) => (
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
    className={className}
    {...props}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

ThemeToggle.displayName = 'ThemeToggle';
