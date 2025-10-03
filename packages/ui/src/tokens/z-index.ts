/**
 * Z-Index Design Tokens
 *
 * Sistema de z-index para controlar layering e stacking order.
 * Organizado em camadas semânticas para evitar conflitos.
 */

// === BASE Z-INDEX SCALE ===
export const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  auto: 'auto',
} as const;

// === SEMANTIC Z-INDEX LAYERS ===
export const semanticZIndex = {
  // Background elements (-1 to 0)
  hide: -1,
  base: 0,

  // Content layers (1-99)
  docked: 10, // Sticky headers, footers
  dropdown: 20, // Dropdown menus, select options
  sticky: 30, // Sticky elements
  banner: 40, // Announcement banners
  overlay: 50, // General overlays

  // Interactive layers (100-999)
  modal: 100, // Modal dialogs
  popover: 200, // Popovers, tooltips
  toast: 300, // Toast notifications
  tooltip: 400, // Tooltips (higher than popovers)

  // System layers (1000+)
  spotlight: 1000, // Feature highlighting
  debug: 9000, // Development/debug overlays
  maximum: 9999, // Emergency maximum
} as const;

// === COMPONENT Z-INDEX ===
export const componentZIndex = {
  // Navigation
  'nav-main': semanticZIndex.sticky,
  'nav-mobile': semanticZIndex.modal,
  'nav-dropdown': semanticZIndex.dropdown,

  // Modals & Dialogs
  'modal-backdrop': semanticZIndex.modal,
  'modal-content': semanticZIndex.modal + 1,
  'modal-close': semanticZIndex.modal + 2,

  // Dropdowns & Menus
  'dropdown-trigger': semanticZIndex.base,
  'dropdown-content': semanticZIndex.dropdown,
  'select-content': semanticZIndex.dropdown,
  'command-dialog': semanticZIndex.modal,

  // Popovers & Tooltips
  'popover-content': semanticZIndex.popover,
  'tooltip-content': semanticZIndex.tooltip,
  'hover-card': semanticZIndex.popover,

  // Notifications
  'toast-viewport': semanticZIndex.toast,
  'toast-item': semanticZIndex.toast + 1,
  'toast-close': semanticZIndex.toast + 2,

  // Form Elements
  'form-error': semanticZIndex.base + 1,
  'form-help': semanticZIndex.base + 1,
  'input-addon': semanticZIndex.base + 1,

  // Loading States
  'loading-overlay': semanticZIndex.overlay,
  'loading-spinner': semanticZIndex.overlay + 1,
  'skeleton-shimmer': semanticZIndex.base + 1,

  // Drag & Drop
  'drag-preview': semanticZIndex.modal,
  'drop-indicator': semanticZIndex.modal + 1,

  // Special Elements
  'backdrop-blur': semanticZIndex.modal - 1,
  'focus-trap': semanticZIndex.maximum - 1,
  announcement: semanticZIndex.banner,
} as const;

// === Z-INDEX GROUPS ===
export const zIndexGroups = {
  background: {
    hide: semanticZIndex.hide,
    base: semanticZIndex.base,
  },

  content: {
    docked: semanticZIndex.docked,
    dropdown: semanticZIndex.dropdown,
    sticky: semanticZIndex.sticky,
    banner: semanticZIndex.banner,
    overlay: semanticZIndex.overlay,
  },

  interactive: {
    modal: semanticZIndex.modal,
    popover: semanticZIndex.popover,
    toast: semanticZIndex.toast,
    tooltip: semanticZIndex.tooltip,
  },

  system: {
    spotlight: semanticZIndex.spotlight,
    debug: semanticZIndex.debug,
    maximum: semanticZIndex.maximum,
  },
} as const;

// === COMBINED Z-INDEX TOKENS ===
export const allZIndex = {
  ...zIndex,
  ...semanticZIndex,
  ...componentZIndex,
} as const;

// === TYPES ===
export type ZIndexToken = keyof typeof zIndex;
export type SemanticZIndexToken = keyof typeof semanticZIndex;
export type ComponentZIndexToken = keyof typeof componentZIndex;
export type AllZIndexToken = keyof typeof allZIndex;
