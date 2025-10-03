'use client';

import * as React from 'react';
import { ThemeProvider, type ThemeProviderProps } from './ThemeProvider';
import { ToastProvider, type ToastProviderProps } from './ToastProvider';

export interface CombinedProvidersProps {
  children: React.ReactNode;
  theme?: Omit<ThemeProviderProps, 'children'>;
  toast?: Omit<ToastProviderProps, 'children'>;
}

/**
 * CombinedProviders component that wraps all necessary providers
 * Provides a convenient way to set up all providers at once
 *
 * @example
 * ```
 * function App() {
 *   return (
 *     <CombinedProviders
 *       theme={{
 *         defaultTheme: 'system',
 *         storageKey: 'app-theme',
 *         enableSystem: true
 *       }}
 *       toast={{
 *         position: 'top-right',
 *         richColors: true,
 *         closeButton: true
 *       }}
 *     >
 *       <YourApp />
 *     </CombinedProviders>
 *   );
 * }
 * ```
 */
export function CombinedProviders({
  children,
  theme = {},
  toast = {},
}: CombinedProvidersProps): JSX.Element {
  return (
    <ThemeProvider {...theme}>
      <ToastProvider {...toast}>{children}</ToastProvider>
    </ThemeProvider>
  );
}
