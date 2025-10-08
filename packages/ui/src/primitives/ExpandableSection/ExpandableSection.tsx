'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn, focusRing } from '../../utils/cn';

export interface ExpandableSectionProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  onToggle?: (expanded: boolean) => void;
}

/**
 * ExpandableSection component - Collapsible content section
 *
 * @example
 * ```
 * function Settings() {
 *   return (
 *     <div className="space-y-4">
 *       <ExpandableSection
 *         title="Account Settings"
 *         subtitle="Manage your account preferences"
 *         defaultExpanded={true}
 *       >
 *         <div className="space-y-4">
 *           <FormField label="Username" />
 *           <FormField label="Email" />
 *         </div>
 *       </ExpandableSection>
 *
 *       <ExpandableSection
 *         title="Privacy Settings"
 *         subtitle="Control your privacy preferences"
 *       >
 *         <div className="space-y-4">
 *           <Checkbox label="Make profile public" />
 *           <Checkbox label="Allow notifications" />
 *         </div>
 *       </ExpandableSection>
 *     </div>
 *   );
 * }
 * ```
 */
export function ExpandableSection({
  children,
  title,
  subtitle,
  defaultExpanded = false,
  className,
  headerClassName,
  contentClassName,
  disabled = false,
  onToggle,
}: ExpandableSectionProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = (): void => {
    if (disabled) {
      return;
    }
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  return (
    <div className={cn('border rounded-lg', className)}>
      {/* Header */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-3 text-left transition-colors',
          'hover:bg-accent/50 focus:bg-accent/50',
          focusRing(),
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isExpanded && 'border-b',
          headerClassName
        )}
        aria-expanded={isExpanded}
        aria-controls={`expandable-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-sm">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>

          <ChevronIcon
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div
          id={`expandable-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className={cn('px-4 py-3', contentClassName)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
