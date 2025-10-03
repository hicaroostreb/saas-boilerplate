'use client';

import * as React from 'react';
import { cn } from '../../utils/cn';

export interface PageLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  sidebarCollapsed?: boolean;
  variant?: 'default' | 'centered' | 'wide' | 'full';
}

/**
 * PageLayout component for consistent page structure
 *
 * @example
 * ```
 * function DashboardPage() {
 *   return (
 *     <PageLayout
 *       header={<DashboardHeader />}
 *       sidebar={<DashboardSidebar />}
 *       footer={<DashboardFooter />}
 *       variant="default"
 *     >
 *       <DashboardContent />
 *     </PageLayout>
 *   );
 * }
 * ```
 */
export function PageLayout({
  children,
  header,
  sidebar,
  footer,
  className,
  sidebarCollapsed = false,
  variant = 'default',
}: PageLayoutProps): JSX.Element {
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {/* Header */}
      {header && <div className="flex-none">{header}</div>}

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {sidebar && (
          <aside
            className={cn(
              'flex-none border-r bg-muted/10 transition-all duration-300',
              sidebarCollapsed ? 'w-16' : 'w-64'
            )}
          >
            {sidebar}
          </aside>
        )}

        {/* Content */}
        <main
          className={cn(
            'flex-1 overflow-auto',

            // Variant styles
            {
              'container mx-auto px-4 py-6 max-w-7xl': variant === 'default',
              'container mx-auto px-4 py-6 max-w-4xl': variant === 'centered',
              'container mx-auto px-4 py-6 max-w-none': variant === 'wide',
              'p-6': variant === 'full',
            }
          )}
        >
          {children}
        </main>
      </div>

      {/* Footer */}
      {footer && <div className="flex-none">{footer}</div>}
    </div>
  );
}
