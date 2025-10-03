/**
 * Border Radius Design Tokens
 *
 * Sistema de border radius para consistência visual.
 * Usado em cards, buttons, inputs e outros componentes.
 */

// === BASE RADIUS SCALE ===
export const radius = {
  none: '0px',
  xs: '0.125rem', // 2px
  sm: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px', // Fully rounded
} as const;

// === SEMANTIC RADIUS ===
export const semanticRadius = {
  // Button radius
  'button-sm': radius.md,
  'button-md': radius.lg,
  'button-lg': radius.xl,

  // Input radius
  'input-default': radius.lg,

  // Card radius
  'card-default': radius.xl,
  'card-large': radius['2xl'],

  // Modal radius
  'modal-content': radius['2xl'],

  // Avatar radius
  'avatar-sm': radius.md,
  'avatar-md': radius.lg,
  'avatar-lg': radius.xl,
  'avatar-full': radius.full,

  // Badge radius
  'badge-default': radius.md,
  'badge-pill': radius.full,

  // Tab radius
  'tab-default': radius.lg,

  // Tooltip radius
  'tooltip-content': radius.md,

  // Dropdown radius
  'dropdown-content': radius.lg,

  // Image radius
  'image-sm': radius.md,
  'image-md': radius.lg,
  'image-lg': radius.xl,
} as const;

// === COMPONENT RADIUS SETS ===
export const componentRadius = {
  // Complex components with multiple radius values
  card: {
    default: semanticRadius['card-default'],
    header: `${semanticRadius['card-default']} ${semanticRadius['card-default']} 0 0`,
    footer: `0 0 ${semanticRadius['card-default']} ${semanticRadius['card-default']}`,
    content: '0',
  },

  modal: {
    content: semanticRadius['modal-content'],
    header: `${semanticRadius['modal-content']} ${semanticRadius['modal-content']} 0 0`,
    footer: `0 0 ${semanticRadius['modal-content']} ${semanticRadius['modal-content']}`,
  },

  dropdown: {
    content: semanticRadius['dropdown-content'],
    item: radius.sm,
  },

  tabs: {
    list: radius.lg,
    trigger: `${radius.lg} ${radius.lg} 0 0`,
    content: `0 ${radius.lg} ${radius.lg} ${radius.lg}`,
  },
} as const;

// === COMBINED RADIUS TOKENS ===
export const allRadius = {
  ...radius,
  ...semanticRadius,
} as const;

// === TYPES ===
export type RadiusToken = keyof typeof radius;
export type SemanticRadiusToken = keyof typeof semanticRadius;
export type AllRadiusToken = keyof typeof allRadius;
export type ComponentRadiusToken = keyof typeof componentRadius;
