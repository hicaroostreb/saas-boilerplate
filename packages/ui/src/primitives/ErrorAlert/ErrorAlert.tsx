'use client';

import { cn } from '../../utils/cn';

export interface ErrorAlertProps {
  message?: string | null;
  className?: string;
  variant?: 'default' | 'destructive' | 'warning';
  dismissible?: boolean;
  onDismiss?: () => void;
}

/**
 * ErrorAlert component - Display error messages and alerts
 *
 * @example
 * ```
 * function LoginForm() {
 *   const [error, setError] = useState<string | null>(null);
 *
 *   return (
 *     <form>
 *       <ErrorAlert
 *         message={error}
 *         dismissible
 *         onDismiss={() => setError(null)}
 *       />
 *
 *       <ErrorAlert
 *         message="Network error occurred"
 *         variant="warning"
 *       />
 *     </form>
 *   );
 * }
 * ```
 */
export function ErrorAlert({
  message,
  className,
  variant = 'destructive',
  dismissible = false,
  onDismiss,
}: ErrorAlertProps): JSX.Element | null {
  if (!message) {
    return null;
  }
  return (
    <div
      className={cn(
        'relative rounded-lg border p-4 text-sm',

        // Variant styles
        {
          'border-border bg-background text-foreground': variant === 'default',
          'border-error/50 bg-error/10 text-error': variant === 'destructive',
          'border-warning/50 bg-warning/10 text-warning': variant === 'warning',
        },

        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {variant === 'destructive' && <ErrorIcon />}
          {variant === 'warning' && <WarningIcon />}
          {variant === 'default' && <InfoIcon />}
        </div>

        {/* Message */}
        <div className="flex-1 leading-relaxed">{message}</div>

        {/* Dismiss button */}
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:opacity-100"
            aria-label="Dismiss alert"
          >
            <CloseIcon />
          </button>
        )}
      </div>
    </div>
  );
}

// Icons
function ErrorIcon(): JSX.Element {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function WarningIcon(): JSX.Element {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function InfoIcon(): JSX.Element {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function CloseIcon(): JSX.Element {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
