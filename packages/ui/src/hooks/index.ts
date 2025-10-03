/**
 * @workspace/ui/hooks - Enterprise React Hooks
 *
 * Custom hooks para lógica compartilhada do design system.
 * Esta camada só pode importar tokens, utils e providers.
 */

// === THEME HOOKS ===
export { useTheme } from './useTheme';

// === UTILITY HOOKS ===
export { useTimeRemaining } from './useTimeRemaining';

// === TYPES ===
export type { ThemeType } from './useTheme';
export type { TimeRemainingResult } from './useTimeRemaining';
