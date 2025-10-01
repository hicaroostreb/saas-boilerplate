// packages/auth/src/utils/security.utils.ts - SECURITY UTILITIES

/**
 * ✅ ENTERPRISE: Security Utilities
 * Single Responsibility: Security and risk display utilities
 */

/**
 * ✅ RISK: Get risk level from score
 */
export function getRiskLevel(score: number): {
  level: 'low' | 'medium' | 'high' | 'critical';
  color: { bg: string; text: string };
  display: string;
} {
  let level: 'low' | 'medium' | 'high' | 'critical';

  if (score >= 80) level = 'critical';
  else if (score >= 60) level = 'high';
  else if (score >= 30) level = 'medium';
  else level = 'low';

  const config = {
    low: {
      color: { bg: 'bg-green-100', text: 'text-green-800' },
      display: 'Low Risk',
    },
    medium: {
      color: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      display: 'Medium Risk',
    },
    high: {
      color: { bg: 'bg-orange-100', text: 'text-orange-800' },
      display: 'High Risk',
    },
    critical: {
      color: { bg: 'bg-red-100', text: 'text-red-800' },
      display: 'Critical Risk',
    },
  } as const;

  return {
    level,
    ...config[level],
  };
}

/**
 * ✅ RISK: Format risk score for display
 */
export function formatRiskScore(score: number): {
  score: number;
  percentage: string;
  level: ReturnType<typeof getRiskLevel>['level'];
  color: string;
} {
  const level = getRiskLevel(score).level;

  const colorMap = {
    low: '#10b981', // green
    medium: '#f59e0b', // yellow
    high: '#f97316', // orange
    critical: '#ef4444', // red
  };

  return {
    score,
    percentage: `${score}%`,
    level,
    color: colorMap[level],
  };
}
