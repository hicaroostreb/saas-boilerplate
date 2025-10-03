/**
 * Breakpoint Design Tokens
 *
 * Sistema de breakpoints para design responsivo.
 * Compatível com Tailwind CSS e mobile-first approach.
 */

// === SCREEN BREAKPOINTS ===
export const screens = {
  xs: '475px', // Extra small devices
  sm: '640px', // Small devices (landscape phones)
  md: '768px', // Medium devices (tablets)
  lg: '1024px', // Large devices (laptops/desktops)
  xl: '1280px', // Extra large devices (large laptops and desktops)
  '2xl': '1536px', // 2X Extra large devices (larger desktops)
} as const;

// === CONTAINER MAX WIDTHS ===
export const containers = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1400px',
  '3xl': '1600px',
} as const;

// === SEMANTIC BREAKPOINTS ===
export const semanticBreakpoints = {
  mobile: screens.xs, // 475px
  tablet: screens.md, // 768px
  desktop: screens.lg, // 1024px
  wide: screens.xl, // 1280px
  ultrawide: screens['2xl'], // 1536px
} as const;

// === MEDIA QUERIES ===
export const mediaQueries = {
  // Mobile first
  mobile: `(min-width: ${screens.xs})`,
  tablet: `(min-width: ${screens.md})`,
  desktop: `(min-width: ${screens.lg})`,
  wide: `(min-width: ${screens.xl})`,
  ultrawide: `(min-width: ${screens['2xl']})`,

  // Max width (desktop first)
  maxMobile: `(max-width: ${screens.sm})`,
  maxTablet: `(max-width: ${screens.lg})`,

  // Orientation
  landscape: '(orientation: landscape)',
  portrait: '(orientation: portrait)',

  // Pixel density
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',

  // Reduced motion
  reduceMotion: '(prefers-reduced-motion: reduce)',

  // Color scheme
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',
} as const;

// === RESPONSIVE GRID COLUMNS ===
export const gridColumns = {
  mobile: 4,
  tablet: 8,
  desktop: 12,
} as const;

// === TYPES ===
export type ScreenToken = keyof typeof screens;
export type ContainerToken = keyof typeof containers;
export type SemanticBreakpointToken = keyof typeof semanticBreakpoints;
export type MediaQueryToken = keyof typeof mediaQueries;
