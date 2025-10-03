'use client';

import * as React from 'react';
import { cn, focusRing } from '../../utils/cn';

export interface DragHandleProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * DragHandle component - Visual handle for drag and drop interactions
 *
 * @example
 * ```
 * function DraggableItem() {
 *   return (
 *     <div className="flex items-center gap-2">
 *       <DragHandle
 *         orientation="vertical"
 *         size="md"
 *         aria-label="Drag to reorder"
 *       />
 *       <span>Draggable content</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function DragHandle({
  orientation = 'vertical',
  size = 'md',
  className,
  ...props
}: DragHandleProps): JSX.Element {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded cursor-grab active:cursor-grabbing transition-colors hover:bg-accent',
        focusRing(),

        // Size variants
        {
          'h-6 w-6': size === 'sm',
          'h-8 w-8': size === 'md',
          'h-10 w-10': size === 'lg',
        },

        className
      )}
      aria-label="Drag handle"
      {...props}
    >
      <DragIcon orientation={orientation} size={size} />
    </button>
  );
}

function DragIcon({
  orientation,
  size,
}: {
  orientation: 'horizontal' | 'vertical';
  size: 'sm' | 'md' | 'lg';
}): JSX.Element {
  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  if (orientation === 'horizontal') {
    return (
      <svg
        className={cn('text-muted-foreground', iconSize)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="9" cy="12" r="1" />
        <circle cx="9" cy="5" r="1" />
        <circle cx="9" cy="19" r="1" />
        <circle cx="15" cy="12" r="1" />
        <circle cx="15" cy="5" r="1" />
        <circle cx="15" cy="19" r="1" />
      </svg>
    );
  }

  return (
    <svg
      className={cn('text-muted-foreground', iconSize)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="9" r="1" />
      <circle cx="5" cy="9" r="1" />
      <circle cx="19" cy="9" r="1" />
      <circle cx="12" cy="15" r="1" />
      <circle cx="5" cy="15" r="1" />
      <circle cx="19" cy="15" r="1" />
    </svg>
  );
}
