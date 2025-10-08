import { type ReactElement } from 'react';
import { toast as sonnerToast } from 'sonner';

// Enhanced toast with design system integration
export const toast = {
  // Basic toasts
  success: (
    message: string,
    options?: Parameters<typeof sonnerToast.success>[1]
  ): string | number =>
    sonnerToast.success(message, {
      className:
        'group-[.toaster]:bg-success group-[.toaster]:text-success-foreground group-[.toaster]:border-success/20',
      ...options,
    }),

  error: (
    message: string,
    options?: Parameters<typeof sonnerToast.error>[1]
  ): string | number =>
    sonnerToast.error(message, {
      className:
        'group-[.toaster]:bg-error group-[.toaster]:text-error-foreground group-[.toaster]:border-error/20',
      ...options,
    }),

  warning: (
    message: string,
    options?: Parameters<typeof sonnerToast>[1]
  ): string | number =>
    sonnerToast(message, {
      className:
        'group-[.toaster]:bg-warning group-[.toaster]:text-warning-foreground group-[.toaster]:border-warning/20',
      ...options,
    }),

  info: (
    message: string,
    options?: Parameters<typeof sonnerToast>[1]
  ): string | number =>
    sonnerToast(message, {
      className:
        'group-[.toaster]:bg-info group-[.toaster]:text-info-foreground group-[.toaster]:border-info/20',
      ...options,
    }),

  // Default toast
  message: (
    message: string,
    options?: Parameters<typeof sonnerToast>[1]
  ): string | number => sonnerToast(message, options),

  // Promise toast for async operations
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
      ...options
    }: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: unknown) => string);
    } & Parameters<typeof sonnerToast>[1] = {}
  ): string | number => {
    // ✅ CORREÇÃO: Voltar para string | number
    return sonnerToast.promise(promise, {
      loading: loading ?? 'Loading...',
      success: success ?? 'Success!',
      error: error ?? 'Something went wrong',
      ...options,
    }) as string | number; // ✅ Type assertion correto
  },

  // Dismissal
  dismiss: (id?: string | number): void => {
    sonnerToast.dismiss(id);
  },

  // Custom toast with full control
  custom: (
    jsx: ReactElement | ((id: string | number) => ReactElement),
    options?: Parameters<typeof sonnerToast.custom>[1]
  ): string | number | undefined => {
    // If jsx is already a function, use it directly
    if (typeof jsx === 'function') {
      return sonnerToast.custom(jsx, options);
    }

    // If jsx is a ReactElement, wrap it in a function
    if (jsx && typeof jsx === 'object' && 'type' in jsx) {
      return sonnerToast.custom(() => jsx, options);
    }

    // Fallback - should not happen with proper typing
    console.warn('Toast custom: jsx must be a ReactElement or function');
    return undefined;
  },
};

// Re-export original for advanced usage
export { toast as sonnerToast } from 'sonner';
