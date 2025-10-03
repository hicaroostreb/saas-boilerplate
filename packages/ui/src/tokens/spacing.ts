/**
 * Spacing Design Tokens
 *
 * Sistema de espaçamento baseado em uma escala consistente.
 * Usado para margin, padding, gaps e outras propriedades de layout.
 */

// === BASE SPACING SCALE ===
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
} as const;

// === SEMANTIC SPACING ===
export const semanticSpacing = {
  // Component internal spacing
  'component-xs': spacing[1], // 4px
  'component-sm': spacing[2], // 8px
  'component-md': spacing[4], // 16px
  'component-lg': spacing[6], // 24px
  'component-xl': spacing[8], // 32px

  // Layout spacing
  'layout-xs': spacing[4], // 16px
  'layout-sm': spacing[6], // 24px
  'layout-md': spacing[8], // 32px
  'layout-lg': spacing[12], // 48px
  'layout-xl': spacing[16], // 64px
  'layout-2xl': spacing[24], // 96px

  // Container spacing
  'container-xs': spacing[4], // 16px
  'container-sm': spacing[6], // 24px
  'container-md': spacing[8], // 32px
  'container-lg': spacing[12], // 48px
  'container-xl': spacing[16], // 64px

  // Section spacing
  'section-xs': spacing[8], // 32px
  'section-sm': spacing[12], // 48px
  'section-md': spacing[16], // 64px
  'section-lg': spacing[24], // 96px
  'section-xl': spacing[32], // 128px
} as const;

// === GRID & FLEXBOX GAPS ===
export const gaps = {
  0: spacing[0],
  1: spacing[1],
  2: spacing[2],
  3: spacing[3],
  4: spacing[4],
  5: spacing[5],
  6: spacing[6],
  8: spacing[8],
  10: spacing[10],
  12: spacing[12],
  16: spacing[16],
  20: spacing[20],
  24: spacing[24],
} as const;

// === COMPONENT SPECIFIC SPACING ===
export const componentSpacing = {
  // Button spacing
  'button-padding-x': {
    sm: spacing[3], // 12px
    md: spacing[4], // 16px
    lg: spacing[6], // 24px
  },
  'button-padding-y': {
    sm: spacing[1.5], // 6px
    md: spacing[2], // 8px
    lg: spacing[3], // 12px
  },

  // Input spacing
  'input-padding-x': spacing[3], // 12px
  'input-padding-y': spacing[2], // 8px

  // Card spacing
  'card-padding': spacing[6], // 24px
  'card-header-padding': spacing[6], // 24px
  'card-content-padding': spacing[6], // 24px

  // Modal spacing
  'modal-padding': spacing[6], // 24px
  'modal-margin': spacing[4], // 16px
} as const;

// === TYPES ===
export type SpacingToken = keyof typeof spacing;
export type SemanticSpacingToken = keyof typeof semanticSpacing;
export type GapToken = keyof typeof gaps;
