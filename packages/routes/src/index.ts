/**
 * @workspace/routes - Enterprise Route Management
 * Single Point of Interface (SPI) following SOLID principles
 * Zero dependencies, type-safe, minimal API surface
 */

// ===== CORE EXPORTS =====
export { buildUrl, routeUtils } from './builders';
export {
  conditionalGuards,
  getRedirectImplementation,
  guards,
  setRedirectImplementation,
} from './guards';
export {
  createTeamNavigation,
  GUEST_ONLY_ROUTES,
  MAIN_NAVIGATION,
  PUBLIC_ROUTES,
  ROUTES,
  SETTINGS_NAVIGATION,
} from './routes';

// ===== TYPE EXPORTS =====
export type { DynamicRoute, NavItem, RouteKey } from './routes';

export type {
  BillingTab as BuilderBillingTab,
  BuildUrlOptions,
} from './builders';

export type {
  ConditionalGuardFunction,
  BillingTab as GuardBillingTab,
  GuardFunction,
  RedirectFunction,
  SettingsSection,
} from './guards';

// ===== CONVENIENCE RE-EXPORTS =====
import { buildUrl, routeUtils } from './builders';
import { conditionalGuards, guards } from './guards';
import {
  createTeamNavigation,
  GUEST_ONLY_ROUTES,
  MAIN_NAVIGATION,
  PUBLIC_ROUTES,
  ROUTES,
  SETTINGS_NAVIGATION,
} from './routes';

/**
 * Commonly used route utilities grouped for convenience
 * Reduces import statements in consuming applications
 */
export const route = {
  // Core route definitions
  ...ROUTES,

  // URL builders
  build: buildUrl,

  // Route guards
  guard: guards,
  conditionalGuard: conditionalGuards,

  // Route utilities
  utils: routeUtils,
} as const;

/**
 * Navigation helpers grouped for UI components
 */
export const navigation = {
  main: MAIN_NAVIGATION,
  settings: SETTINGS_NAVIGATION,
  createTeam: createTeamNavigation,
} as const;

/**
 * Route classifications for authentication logic
 */
export const routeTypes = {
  public: PUBLIC_ROUTES,
  guestOnly: GUEST_ONLY_ROUTES,
} as const;

// ===== PACKAGE METADATA =====
export const packageInfo = {
  name: '@workspace/routes',
  version: '0.1.0',
  description: 'Enterprise route management for Next.js applications',
} as const;
