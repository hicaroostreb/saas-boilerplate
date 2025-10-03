'use client';

import * as React from 'react';
import { cn } from '../../utils/cn';

export interface HeaderProps {
  children: React.ReactNode;
  variant?: 'default' | 'sticky' | 'floating';
  className?: string;
  as?: 'header' | 'div' | 'section';
}

/**
 * Generic Header component for flexible header layouts
 *
 * @example
 * ```
 * function AppHeader() {
 *   return (
 *     <Header variant="sticky" className="border-b">
 *       <div className="container flex items-center justify-between">
 *         <Logo />
 *         <Navigation />
 *         <UserMenu />
 *       </div>
 *     </Header>
 *   );
 * }
 * ```
 */
export function Header({
  children,
  variant = 'default',
  className,
  as: Component = 'header',
}: HeaderProps): JSX.Element {
  return (
    <Component
      className={cn(
        // Base styles
        'w-full bg-background',

        // Variant styles
        {
          // Default header
          relative: variant === 'default',

          // Sticky header
          'sticky top-0 z-50 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60':
            variant === 'sticky',

          // Floating header
          'fixed top-4 left-1/2 z-50 mx-auto max-w-5xl -translate-x-1/2 rounded-lg border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg':
            variant === 'floating',
        },

        className
      )}
    >
      {children}
    </Component>
  );
}
