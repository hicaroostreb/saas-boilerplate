'use client';

import * as React from 'react';
import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from '../../hooks/useTheme';

export interface ToastProviderProps {
  children: React.ReactNode;
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center';
  expand?: boolean;
  richColors?: boolean;
  closeButton?: boolean;
  toastOptions?: {
    duration?: number;
    className?: string;
    style?: React.CSSProperties;
  };
}

/**
 * ToastProvider component that provides toast functionality to the app
 *
 * @example
 * ```
 * function App() {
 *   return (
 *     <ToastProvider
 *       position="top-right"
 *       expand={true}
 *       richColors={true}
 *       closeButton={true}
 *     >
 *       <YourApp />
 *       <Toaster />
 *     </ToastProvider>
 *   );
 * }
 * ```
 */
export function ToastProvider({
  children,
  position = 'bottom-right',
  expand = false,
  richColors = true,
  closeButton = false,
  toastOptions = {},
}: ToastProviderProps): JSX.Element {
  return (
    <>
      {children}
      <Toaster
        position={position}
        expand={expand}
        richColors={richColors}
        closeButton={closeButton}
        toastOptions={toastOptions}
      />
    </>
  );
}

/**
 * Toaster component that renders the toast container
 * Should be placed once in your app, preferably in the root layout
 */
export function Toaster({
  position = 'bottom-right',
  expand = false,
  richColors = true,
  closeButton = false,
  toastOptions = {},
}: Omit<ToastProviderProps, 'children'>): JSX.Element {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme === 'system' ? 'system' : theme}
      className="toaster group"
      position={position}
      expand={expand}
      richColors={richColors}
      closeButton={closeButton}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
        duration: 4000,
        ...toastOptions,
      }}
    />
  );
}
