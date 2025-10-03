/**
 * Animation Design Tokens
 *
 * Sistema de animações e transições consistentes.
 * Baseado em motion design principles e acessibilidade.
 */

// === TIMING FUNCTIONS (EASING) ===
export const easing = {
  linear: 'linear',

  // Standard easing
  ease: 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',

  // Custom cubic-bezier curves
  'ease-smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'ease-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'ease-elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',

  // Material Design curves
  'ease-standard': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  'ease-decelerate': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  'ease-accelerate': 'cubic-bezier(0.4, 0.0, 1, 1)',
  'ease-sharp': 'cubic-bezier(0.4, 0.0, 0.6, 1)',
} as const;

// === DURATION TOKENS ===
export const duration = {
  0: '0ms',
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
} as const;

// === SEMANTIC DURATIONS ===
export const semanticDuration = {
  // Micro-interactions
  instant: duration[0], // 0ms
  fast: duration[150], // 150ms
  normal: duration[300], // 300ms
  slow: duration[500], // 500ms

  // Page transitions
  'page-enter': duration[300],
  'page-exit': duration[200],

  // Modal transitions
  'modal-enter': duration[200],
  'modal-exit': duration[150],

  // Tooltip transitions
  'tooltip-enter': duration[100],
  'tooltip-exit': duration[75],

  // Loading states
  'loading-fast': duration[300],
  'loading-normal': duration[500],
  'loading-slow': duration[1000],
} as const;

// === ANIMATION PRESETS ===
export const animationPresets = {
  // Fade animations
  'fade-in': {
    duration: semanticDuration.normal,
    easing: easing['ease-out'],
    keyframes: 'fadeIn',
  },
  'fade-out': {
    duration: semanticDuration.fast,
    easing: easing['ease-in'],
    keyframes: 'fadeOut',
  },

  // Slide animations
  'slide-in-up': {
    duration: semanticDuration.normal,
    easing: easing['ease-standard'],
    keyframes: 'slideInUp',
  },
  'slide-in-down': {
    duration: semanticDuration.normal,
    easing: easing['ease-standard'],
    keyframes: 'slideInDown',
  },
  'slide-in-left': {
    duration: semanticDuration.normal,
    easing: easing['ease-standard'],
    keyframes: 'slideInLeft',
  },
  'slide-in-right': {
    duration: semanticDuration.normal,
    easing: easing['ease-standard'],
    keyframes: 'slideInRight',
  },

  // Scale animations
  'scale-in': {
    duration: semanticDuration.fast,
    easing: easing['ease-bounce'],
    keyframes: 'scaleIn',
  },
  'scale-out': {
    duration: semanticDuration.fast,
    easing: easing['ease-in'],
    keyframes: 'scaleOut',
  },

  // Spin animations
  spin: {
    duration: duration[1000],
    easing: easing.linear,
    keyframes: 'spin',
    iterationCount: 'infinite',
  },

  // Pulse animations
  pulse: {
    duration: duration[1000],
    easing: easing['ease-in-out'],
    keyframes: 'pulse',
    iterationCount: 'infinite',
  },

  // Bounce animations
  bounce: {
    duration: duration[1000],
    easing: easing['ease-bounce'],
    keyframes: 'bounce',
    iterationCount: 'infinite',
  },
} as const;

// === TRANSITION PRESETS ===
export const transitionPresets = {
  // Common transitions
  all: `all ${semanticDuration.normal} ${easing['ease-standard']}`,
  colors: `color ${semanticDuration.fast} ${easing['ease-standard']}, background-color ${semanticDuration.fast} ${easing['ease-standard']}, border-color ${semanticDuration.fast} ${easing['ease-standard']}`,
  opacity: `opacity ${semanticDuration.fast} ${easing['ease-standard']}`,
  shadow: `box-shadow ${semanticDuration.fast} ${easing['ease-standard']}`,
  transform: `transform ${semanticDuration.normal} ${easing['ease-standard']}`,

  // Component specific
  button: `all ${semanticDuration.fast} ${easing['ease-standard']}`,
  input: `border-color ${semanticDuration.fast} ${easing['ease-standard']}, box-shadow ${semanticDuration.fast} ${easing['ease-standard']}`,
  modal: `opacity ${semanticDuration['modal-enter']} ${easing['ease-standard']}, transform ${semanticDuration['modal-enter']} ${easing['ease-standard']}`,
  tooltip: `opacity ${semanticDuration['tooltip-enter']} ${easing['ease-standard']}, transform ${semanticDuration['tooltip-enter']} ${easing['ease-standard']}`,
} as const;

// === TYPES ===
export type EasingToken = keyof typeof easing;
export type DurationToken = keyof typeof duration;
export type SemanticDurationToken = keyof typeof semanticDuration;
export type AnimationPresetToken = keyof typeof animationPresets;
export type TransitionPresetToken = keyof typeof transitionPresets;
