'use client';

import * as React from 'react';
import { cn } from '../../utils/cn';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'dashed' | 'dotted';
}

/**
 * Divider component - Visual separator with optional label
 *
 * @example
 * ```
 * function Content() {
 *   return (
 *     <div>
 *       <section>Content A</section>
 *
 *       <Divider />
 *
 *       <section>Content B</section>
 *
 *       <Divider orientation="horizontal">
 *         OR
 *       </Divider>
 *
 *       <section>Content C</section>
 *     </div>
 *   );
 * }
 * ```
 */
export function Divider({
  orientation = 'horizontal',
  className,
  children,
  variant = 'default',
}: DividerProps): JSX.Element {
  if (children) {
    return (
      <div
        className={cn(
          'relative flex items-center',
          orientation === 'horizontal' ? 'w-full' : 'h-full flex-col',
          className
        )}
      >
        <div
          className={cn(
            'flex-1 border-border',
            orientation === 'horizontal' ? 'border-t' : 'border-l',
            {
              'border-dashed': variant === 'dashed',
              'border-dotted': variant === 'dotted',
            }
          )}
        />
        <div
          className={cn(
            'bg-background px-3 text-xs font-medium text-muted-foreground',
            orientation === 'vertical' && 'py-3 px-0'
          )}
        >
          {children}
        </div>
        <div
          className={cn(
            'flex-1 border-border',
            orientation === 'horizontal' ? 'border-t' : 'border-l',
            {
              'border-dashed': variant === 'dashed',
              'border-dotted': variant === 'dotted',
            }
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-border',
        orientation === 'horizontal' ? 'w-full border-t' : 'h-full border-l',
        {
          'border-dashed': variant === 'dashed',
          'border-dotted': variant === 'dotted',
        },
        className
      )}
      role="separator"
      aria-orientation={orientation}
    />
  );
}
