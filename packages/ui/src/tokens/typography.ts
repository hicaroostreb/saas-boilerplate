/**
 * Typography Design Tokens
 *
 * Sistema tipográfico baseado em escala modular e hierarchy visual.
 * Compatível com Tailwind CSS typography utilities.
 */

// === FONT FAMILIES ===
export const fontFamilies = {
  sans: 'var(--font-sans)',
  serif: 'var(--font-serif)',
  mono: 'var(--font-mono)',
} as const;

// === FONT SIZES ===
export const fontSizes = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem', // 72px
  '8xl': '6rem', // 96px
  '9xl': '8rem', // 128px
} as const;

// === FONT WEIGHTS ===
export const fontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

// === LINE HEIGHTS ===
export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
  3: '.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
} as const;

// === LETTER SPACING ===
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// === TYPOGRAPHY SCALE (SEMANTIC) ===
export const typographyScale = {
  // Display
  'display-2xl': {
    fontSize: fontSizes['8xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacing.tighter,
  },
  'display-xl': {
    fontSize: fontSizes['7xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tighter,
  },
  'display-lg': {
    fontSize: fontSizes['6xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },

  // Headings
  'heading-xl': {
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
  },
  'heading-lg': {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
  },
  'heading-md': {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
  },
  'heading-sm': {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
  },
  'heading-xs': {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
  },

  // Body
  'body-lg': {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
  },
  'body-md': {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },
  'body-sm': {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },
  'body-xs': {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },

  // Labels
  'label-lg': {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
  },
  'label-md': {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
  },
  'label-sm': {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
  },
} as const;

// === TYPES ===
export type FontFamilyToken = keyof typeof fontFamilies;
export type FontSizeToken = keyof typeof fontSizes;
export type FontWeightToken = keyof typeof fontWeights;
export type LineHeightToken = keyof typeof lineHeights;
export type LetterSpacingToken = keyof typeof letterSpacing;
export type TypographyScaleToken = keyof typeof typographyScale;
