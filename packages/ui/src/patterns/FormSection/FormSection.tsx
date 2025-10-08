'use client';

import * as React from 'react';
import { cn } from '../../utils/cn';

export interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'card' | 'inline';
}

/**
 * FormSection component for organizing form content
 *
 * @example
 * ```
 * function ProfileForm() {
 *   return (
 *     <form>
 *       <FormSection
 *         title="Personal Information"
 *         description="Update your personal details and preferences"
 *         variant="card"
 *       >
 *         <FormField label="Name" />
 *         <FormField label="Email" />
 *       </FormSection>
 *
 *       <FormSection
 *         title="Security"
 *         description="Manage your password and security settings"
 *         variant="card"
 *       >
 *         <FormField label="Current Password" type="password" />
 *         <FormField label="New Password" type="password" />
 *       </FormSection>
 *     </form>
 *   );
 * }
 * ```
 */
export function FormSection({
  children,
  title,
  description,
  className,
  variant = 'default',
}: FormSectionProps): JSX.Element {
  const content = (
    <>
      {/* Header */}
      {(title ?? description) && (
        <div
          className={cn('space-y-1', variant === 'inline' ? 'mb-4' : 'mb-6')}
        >
          {title && (
            <h3
              className={cn(
                'font-semibold leading-none tracking-tight',
                variant === 'inline' ? 'text-sm' : 'text-lg'
              )}
            >
              {title}
            </h3>
          )}
          {description && (
            <p
              className={cn(
                'text-muted-foreground',
                variant === 'inline' ? 'text-xs' : 'text-sm'
              )}
            >
              {description}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">{children}</div>
    </>
  );

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'rounded-lg border bg-card text-card-foreground shadow-sm p-6',
          className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <section
      className={cn(
        variant === 'inline' ? 'space-y-2' : 'space-y-4',
        className
      )}
    >
      {content}
    </section>
  );
}
