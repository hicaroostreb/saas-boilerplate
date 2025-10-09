'use client';

import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';

export interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { theme } = useTheme();

  return (
    <>
      {children}
      <Toaster
        theme={theme as 'light' | 'dark' | 'system'}
        className="toaster group"
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
        }}
        position="bottom-right"
        richColors
      />
    </>
  );
}
