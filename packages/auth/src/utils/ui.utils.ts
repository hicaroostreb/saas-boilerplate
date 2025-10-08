// packages/auth/src/utils/ui.utils.ts - UI UTILITIES

import type { MemberRole, SecurityLevel } from '../types';

/**
 * ✅ ENTERPRISE: UI Utilities
 * Single Responsibility: UI styling and display utilities
 */

// ✅ CORREÇÃO: Cache síncrono para dependências opcionais
let clsxCache: ((inputs: unknown) => string) | null | undefined = undefined;
let twMergeCache: ((classes: string) => string) | null | undefined = undefined;

// Função para carregar dependências de forma lazy
const loadDependencies = () => {
  // Carregar clsx
  if (clsxCache === undefined) {
    try {
      // Usar eval para evitar error de análise estática
      const clsxModule = eval('require')('clsx');
      clsxCache = clsxModule.default ?? clsxModule;
    } catch {
      clsxCache = null;
    }
  }

  // Carregar tailwind-merge
  if (twMergeCache === undefined) {
    try {
      const twMergeModule = eval('require')('tailwind-merge');
      twMergeCache = twMergeModule.twMerge;
    } catch {
      twMergeCache = null;
    }
  }
};

/**
 * ✅ TAILWIND: Class name utility (fallback implementation)
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  loadDependencies();

  if (clsxCache && twMergeCache) {
    return twMergeCache(clsxCache(inputs));
  }

  // Fallback without dependencies
  return inputs
    .filter(
      (input): input is string => Boolean(input) && typeof input === 'string'
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * ✅ SECURITY: Get security level colors
 */
export function getSecurityLevelColor(level: SecurityLevel): {
  bg: string;
  text: string;
  border: string;
} {
  const colors = {
    normal: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    elevated: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
    },
    high_risk: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
    critical: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
  } as const;

  return colors[level] || colors.normal;
}

/**
 * ✅ SECURITY: Get security level display name
 */
export function getSecurityLevelName(level: SecurityLevel): string {
  const names = {
    normal: 'Normal',
    elevated: 'Elevated',
    high_risk: 'High Risk',
    critical: 'Critical',
  } as const;

  return names[level] || 'Unknown';
}

/**
 * ✅ ROLE: Get member role display name
 */
export function getMemberRoleName(role: MemberRole): string {
  const names = {
    owner: 'Owner',
    admin: 'Administrator',
    member: 'Member',
    viewer: 'Viewer',
    guest: 'Guest',
  } as const;

  return names[role] || 'Unknown';
}

/**
 * ✅ ROLE: Get member role colors
 */
export function getMemberRoleColor(role: MemberRole): {
  bg: string;
  text: string;
} {
  const colors = {
    owner: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
    },
    admin: {
      bg: 'bg-red-100',
      text: 'text-red-800',
    },
    member: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
    },
    viewer: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
    },
    guest: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
    },
  } as const;

  return colors[role] || colors.member;
}
