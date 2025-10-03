/**
 * @workspace/ui/providers - Infrastructure Layer
 *
 * Providers globais para o design system.
 * Esta camada só pode importar tokens, utils e hooks.
 */

// === THEME PROVIDER ===
export { ThemeProvider, ThemeProviderContext } from './ThemeProvider';
export type { ThemeProviderProps, ThemeProviderState } from './ThemeProvider';

// === TOAST PROVIDER ===
export { ToastProvider, Toaster } from './ToastProvider';
export type { ToastProviderProps } from './ToastProvider';
export { sonnerToast, toast } from './ToastProvider/toast';

// === COMBINED PROVIDERS ===
export { CombinedProviders } from './CombinedProviders';
export type { CombinedProvidersProps } from './CombinedProviders';
