/**
 * Shadow Design Tokens
 *
 * Sistema de sombras para criar hierarquia visual e profundidade.
 * Baseado em Material Design e design systems modernos.
 */

// === BASE SHADOW SCALE ===
export const shadows = {
  none: 'none',

  // Subtle shadows
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',

  // Standard shadows
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',

  // Large shadows
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// === SEMANTIC SHADOWS ===
export const semanticShadows = {
  // Card shadows
  'card-rest': shadows.sm,
  'card-hover': shadows.md,
  'card-active': shadows.lg,

  // Button shadows
  'button-rest': shadows.xs,
  'button-hover': shadows.sm,
  'button-active': shadows.inner,

  // Modal shadows
  'modal-backdrop': shadows['2xl'],
  'modal-content': shadows.xl,

  // Dropdown shadows
  'dropdown-content': shadows.lg,

  // Tooltip shadows
  'tooltip-content': shadows.md,

  // Navigation shadows
  'nav-elevated': shadows.sm,

  // Input shadows
  'input-focus': shadows.sm,
  'input-error': '0 0 0 1px rgb(239 68 68 / 0.5), 0 1px 3px 0 rgb(0 0 0 / 0.1)',

  // Loading shadows
  'loading-skeleton': shadows.xs,
} as const;

// === COLORED SHADOWS ===
export const coloredShadows = {
  // Primary colored shadows
  'primary-sm':
    '0 1px 3px 0 hsl(var(--primary) / 0.2), 0 1px 2px -1px hsl(var(--primary) / 0.2)',
  'primary-md':
    '0 4px 6px -1px hsl(var(--primary) / 0.2), 0 2px 4px -2px hsl(var(--primary) / 0.2)',
  'primary-lg':
    '0 10px 15px -3px hsl(var(--primary) / 0.2), 0 4px 6px -4px hsl(var(--primary) / 0.2)',

  // Success colored shadows
  'success-sm':
    '0 1px 3px 0 hsl(var(--success) / 0.2), 0 1px 2px -1px hsl(var(--success) / 0.2)',
  'success-md':
    '0 4px 6px -1px hsl(var(--success) / 0.2), 0 2px 4px -2px hsl(var(--success) / 0.2)',

  // Error colored shadows
  'error-sm':
    '0 1px 3px 0 hsl(var(--error) / 0.2), 0 1px 2px -1px hsl(var(--error) / 0.2)',
  'error-md':
    '0 4px 6px -1px hsl(var(--error) / 0.2), 0 2px 4px -2px hsl(var(--error) / 0.2)',

  // Warning colored shadows
  'warning-sm':
    '0 1px 3px 0 hsl(var(--warning) / 0.2), 0 1px 2px -1px hsl(var(--warning) / 0.2)',
  'warning-md':
    '0 4px 6px -1px hsl(var(--warning) / 0.2), 0 2px 4px -2px hsl(var(--warning) / 0.2)',
} as const;

// === GLOW EFFECTS ===
export const glowEffects = {
  'glow-primary': '0 0 20px hsl(var(--primary) / 0.3)',
  'glow-success': '0 0 20px hsl(var(--success) / 0.3)',
  'glow-error': '0 0 20px hsl(var(--error) / 0.3)',
  'glow-warning': '0 0 20px hsl(var(--warning) / 0.3)',
  'glow-info': '0 0 20px hsl(var(--info) / 0.3)',
} as const;

// === COMBINED SHADOW TOKENS ===
export const allShadows = {
  ...shadows,
  ...semanticShadows,
  ...coloredShadows,
  ...glowEffects,
} as const;

// === TYPES ===
export type ShadowToken = keyof typeof shadows;
export type SemanticShadowToken = keyof typeof semanticShadows;
export type ColoredShadowToken = keyof typeof coloredShadows;
export type GlowEffectToken = keyof typeof glowEffects;
export type AllShadowToken = keyof typeof allShadows;
