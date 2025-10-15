/**
 * @workspace/http - HTTP Adapter Package
 * Enterprise HTTP handling for Next.js applications
 * Maintains compatibility with existing route definitions
 */

// ===== ROUTE DEFINITIONS (mantidos para compatibilidade) =====
export {
  createTeamNavigation,
  GUEST_ONLY_ROUTES,
  MAIN_NAVIGATION,
  PUBLIC_ROUTES,
  ROUTES,
  SETTINGS_NAVIGATION,
} from './routes';

export type { DynamicRoute, NavItem, RouteKey } from './routes';

// ===== HTTP CONTROLLERS =====
export { BaseController } from './controllers/base.controller';
export type { ApiResponse } from './controllers/base.controller';

// ===== HTTP MIDDLEWARE =====
export {
  authApiMiddleware,
  composeMiddleware,
  conditionalGuards,
  corsMiddleware,
  getRedirectImplementation,
  guards,
  rateLimitMiddleware,
  setRedirectImplementation,
} from './middleware';

export type {
  ConditionalGuardFunction,
  BillingTab as GuardBillingTab,
  GuardFunction,
  HttpMiddleware,
  RedirectFunction,
  SettingsSection,
} from './middleware';

// ===== HTTP BUILDERS =====
export { buildUrl, createHttpRoute, routeUtils } from './builders';

export type {
  BillingTab as BuilderBillingTab,
  BuildUrlOptions,
  RouteHandler,
} from './builders';

// ===== CONVENIENCE EXPORTS (mantidos para compatibilidade) =====
import { buildUrl, routeUtils } from './builders';
import { conditionalGuards, guards } from './middleware';
import {
  createTeamNavigation,
  GUEST_ONLY_ROUTES,
  MAIN_NAVIGATION,
  PUBLIC_ROUTES,
  ROUTES,
  SETTINGS_NAVIGATION,
} from './routes';

export const route = {
  ...ROUTES,
  build: buildUrl,
  guard: guards,
  conditionalGuard: conditionalGuards,
  utils: routeUtils,
} as const;

export const navigation = {
  main: MAIN_NAVIGATION,
  settings: SETTINGS_NAVIGATION,
  createTeam: createTeamNavigation,
} as const;

export const routeTypes = {
  public: PUBLIC_ROUTES,
  guestOnly: GUEST_ONLY_ROUTES,
} as const;

// ===== PACKAGE METADATA =====
export const packageInfo = {
  name: '@workspace/http',
  version: '0.1.0',
  description: 'HTTP adapter for Next.js applications',
} as const;

// ===== NEXT.JS RE-EXPORTS =====
export { NextRequest, NextResponse } from 'next/server';
export { z } from 'zod';
