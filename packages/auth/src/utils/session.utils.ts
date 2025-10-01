// packages/auth/src/utils/session.utils.ts - SESSION UTILITIES

import type { SessionListItem } from '../types/session.types';

/**
 * ✅ ENTERPRISE: Session Utilities
 * Single Responsibility: Session formatting and display utilities
 */

/**
 * ✅ FORMAT: Session duration
 */
export function formatSessionDuration(
  createdAt: Date,
  lastAccessedAt?: Date | null
): string {
  const start = createdAt.getTime();
  const end = lastAccessedAt?.getTime() ?? Date.now();
  const duration = end - start;

  const minutes = Math.floor(duration / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * ✅ TIME: Get session time remaining
 */
export function getSessionTimeRemaining(expires: Date): {
  timeRemaining: number; // milliseconds
  isExpired: boolean;
  display: string;
} {
  const now = Date.now();
  const expiresAt = expires.getTime();
  const timeRemaining = expiresAt - now;
  const isExpired = timeRemaining <= 0;

  if (isExpired) {
    return {
      timeRemaining: 0,
      isExpired: true,
      display: 'Expired',
    };
  }

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  let display = '';
  if (days > 0) {
    display = `${days}d ${hours}h`;
  } else if (hours > 0) {
    display = `${hours}h ${minutes}m`;
  } else {
    display = `${minutes}m`;
  }

  return {
    timeRemaining,
    isExpired,
    display,
  };
}

/**
 * ✅ STATUS: Get session status
 */
export function getSessionStatus(_session: SessionListItem): {
  status: 'active' | 'expired' | 'revoked' | 'idle';
  color: { bg: string; text: string };
  display: string;
} {
  // Default to active if no status field
  const status = 'active';

  const statusConfig = {
    active: {
      color: { bg: 'bg-green-100', text: 'text-green-800' },
      display: 'Active',
    },
    expired: {
      color: { bg: 'bg-gray-100', text: 'text-gray-800' },
      display: 'Expired',
    },
    revoked: {
      color: { bg: 'bg-red-100', text: 'text-red-800' },
      display: 'Revoked',
    },
    idle: {
      color: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      display: 'Idle',
    },
  } as const;

  return {
    status,
    ...statusConfig[status],
  };
}
