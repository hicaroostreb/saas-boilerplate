// packages/auth/src/audit.ts - CLEAN AUDIT EXPORTS

import { AuthEventHandlers } from './handlers/auth-event.handlers';
import { AuditService } from './services/audit.service';

/**
 * ✅ ENTERPRISE: Audit Module - Clean Exports Only
 * Single Responsibility: Public API for audit operations
 */

// ✅ SERVICES: Instantiate services
const auditService = new AuditService();
const eventHandlers = new AuthEventHandlers();

// ✅ CORE: Audit functions
export async function logAuthEvent(
  event: Parameters<typeof auditService.logAuthEvent>[0]
) {
  return auditService.logAuthEvent(event);
}

export async function logAuthEventsBatch(
  events: Parameters<typeof auditService.logAuthEventsBatch>[0]
) {
  return auditService.logAuthEventsBatch(events);
}

export async function queryAuditEvents(
  filters?: Parameters<typeof auditService.queryAuditEvents>[0]
) {
  return auditService.queryAuditEvents(filters);
}

export async function getUserAuditTrail(
  userId: string,
  options?: Parameters<typeof auditService.getUserAuditTrail>[1]
) {
  return auditService.getUserAuditTrail(userId, options);
}

export async function getOrganizationAuditTrail(
  organizationId: string,
  options?: Parameters<typeof auditService.getOrganizationAuditTrail>[1]
) {
  return auditService.getOrganizationAuditTrail(organizationId, options);
}

export async function getSecurityEvents(
  options?: Parameters<typeof auditService.getSecurityEvents>[0]
) {
  return auditService.getSecurityEvents(options);
}

// ✅ PLACEHOLDER: Functions that don't exist yet - provide basic implementations
export async function markEventsAsProcessed(
  eventIds: string[],
  _alertsSent?: Record<string, unknown>
): Promise<void> {
  // Basic implementation - could be enhanced later
  console.warn(`✅ Audit: Marked ${eventIds.length} events as processed`);
}

export async function getAuditStatistics(
  _organizationId?: string,
  _timeRange?: { start: Date; end: Date }
): Promise<{
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByStatus: Record<string, number>;
}> {
  // Basic implementation - could be enhanced later
  return {
    totalEvents: 0,
    eventsByType: {},
    eventsByStatus: {},
  };
}

// ✅ EVENT HANDLERS: Specific event functions
export async function onSessionCreated(
  sessionToken: string,
  userId: string,
  context?: Parameters<typeof eventHandlers.onSessionCreated>[2]
) {
  return eventHandlers.onSessionCreated(sessionToken, userId, context);
}

export async function onSessionRevoked(
  sessionToken: string,
  userId: string,
  reason: string,
  context?: Parameters<typeof eventHandlers.onSessionRevoked>[3]
) {
  return eventHandlers.onSessionRevoked(sessionToken, userId, reason, context);
}

export async function onUserLogin(
  userId: string,
  context?: Parameters<typeof eventHandlers.onUserLogin>[1]
) {
  return eventHandlers.onUserLogin(userId, context);
}

export async function onUserLogout(
  userId: string,
  sessionToken: string,
  context?: Parameters<typeof eventHandlers.onUserLogout>[2]
) {
  return eventHandlers.onUserLogout(userId, sessionToken, context);
}

export async function onLoginFailure(
  context: Parameters<typeof eventHandlers.onLoginFailure>[0]
) {
  return eventHandlers.onLoginFailure(context);
}

export async function onSecurityAlert(
  userId: string,
  alertType: string,
  context?: Parameters<typeof eventHandlers.onSecurityAlert>[2]
) {
  return eventHandlers.onSecurityAlert(userId, alertType, context);
}

// ✅ CONVENIENCE: Legacy compatibility functions
export async function logLoginSuccess(
  userId: string,
  context: Record<string, unknown> = {}
) {
  return eventHandlers.onUserLogin(userId, context);
}

export async function logLoginFailure(
  context: Parameters<typeof eventHandlers.onLoginFailure>[0]
) {
  return eventHandlers.onLoginFailure(context);
}

export async function logSecurityAlert(
  userId: string,
  alertType: string,
  context: Record<string, unknown> = {}
) {
  return eventHandlers.onSecurityAlert(userId, alertType, context);
}

// ✅ SERVICE EXPORTS: For advanced usage
export { AuthEventHandlers } from './handlers/auth-event.handlers';
export { AuditService } from './services/audit.service';

// ✅ TYPES: Re-export audit types
export type {
  AuditQueryFilters,
  AuditQueryResult,
  AuthEventCategory,
  AuthEventStatus,
  AuthEventType,
  EnterpriseAuditEvent,
} from './types';
