/**
 * Color Design Tokens
 *
 * Sistema de cores baseado em CSS Variables para suporte a temas.
 * Compatível com Tailwind CSS e padrões modernos de design system.
 */

// === PRIMARY COLOR SCALE ===
export const primaryColors = {
  50: 'hsl(var(--primary-50))',
  100: 'hsl(var(--primary-100))',
  200: 'hsl(var(--primary-200))',
  300: 'hsl(var(--primary-300))',
  400: 'hsl(var(--primary-400))',
  500: 'hsl(var(--primary-500))',
  600: 'hsl(var(--primary-600))',
  700: 'hsl(var(--primary-700))',
  800: 'hsl(var(--primary-800))',
  900: 'hsl(var(--primary-900))',
  950: 'hsl(var(--primary-950))',
} as const;

// === NEUTRAL COLOR SCALE ===
export const neutralColors = {
  0: 'hsl(var(--neutral-0))',
  50: 'hsl(var(--neutral-50))',
  100: 'hsl(var(--neutral-100))',
  200: 'hsl(var(--neutral-200))',
  300: 'hsl(var(--neutral-300))',
  400: 'hsl(var(--neutral-400))',
  500: 'hsl(var(--neutral-500))',
  600: 'hsl(var(--neutral-600))',
  700: 'hsl(var(--neutral-700))',
  800: 'hsl(var(--neutral-800))',
  900: 'hsl(var(--neutral-900))',
  950: 'hsl(var(--neutral-950))',
  1000: 'hsl(var(--neutral-1000))',
} as const;

// === SEMANTIC COLORS ===
export const semanticColors = {
  // Success
  success: 'hsl(var(--success))',
  'success-foreground': 'hsl(var(--success-foreground))',

  // Error/Destructive
  error: 'hsl(var(--error))',
  'error-foreground': 'hsl(var(--error-foreground))',
  destructive: 'hsl(var(--destructive))',
  'destructive-foreground': 'hsl(var(--destructive-foreground))',

  // Warning
  warning: 'hsl(var(--warning))',
  'warning-foreground': 'hsl(var(--warning-foreground))',

  // Info
  info: 'hsl(var(--info))',
  'info-foreground': 'hsl(var(--info-foreground))',
} as const;

// === UI COMPONENT COLORS ===
export const uiColors = {
  // Base
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',

  // Card
  card: 'hsl(var(--card))',
  'card-foreground': 'hsl(var(--card-foreground))',

  // Popover
  popover: 'hsl(var(--popover))',
  'popover-foreground': 'hsl(var(--popover-foreground))',

  // Primary
  primary: 'hsl(var(--primary))',
  'primary-foreground': 'hsl(var(--primary-foreground))',

  // Secondary
  secondary: 'hsl(var(--secondary))',
  'secondary-foreground': 'hsl(var(--secondary-foreground))',

  // Muted
  muted: 'hsl(var(--muted))',
  'muted-foreground': 'hsl(var(--muted-foreground))',

  // Accent
  accent: 'hsl(var(--accent))',
  'accent-foreground': 'hsl(var(--accent-foreground))',

  // Border & Input
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
} as const;

// === CONSOLIDATED COLOR TOKENS ===
export const colors = {
  ...primaryColors,
  ...neutralColors,
  ...semanticColors,
  ...uiColors,
} as const;

// === TYPES ===
export type ColorToken = keyof typeof colors;
export type PrimaryColorToken = keyof typeof primaryColors;
export type NeutralColorToken = keyof typeof neutralColors;
export type SemanticColorToken = keyof typeof semanticColors;
export type UIColorToken = keyof typeof uiColors;
