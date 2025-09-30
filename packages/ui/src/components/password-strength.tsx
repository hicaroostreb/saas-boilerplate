// packages/ui/src/components/password-strength.tsx - ENTERPRISE ACHROMATIC ADAPTATION

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

interface PasswordStrengthProps {
  password: string;
  className?: string;

  // ✅ ENTERPRISE: New props for enterprise features
  showProgress?: boolean;
  showAllRequirements?: boolean;
  requireSpecialChars?: boolean;
  minLength?: number;

  // ✅ ENTERPRISE: Context for personalized checks
  email?: string;
  name?: string;

  // ✅ ENTERPRISE: Customization
  variant?: 'minimal' | 'detailed' | 'progress';
}

interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
  weight: number; // ✅ ENTERPRISE: Weight for strength calculation
}

// ✅ ENTERPRISE: Strength levels
type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

export function PasswordStrength({
  password,
  className,
  showProgress = false,
  showAllRequirements = false,
  requireSpecialChars = false,
  minLength = 8,
  email,
  name,
  variant = 'minimal',
}: PasswordStrengthProps) {
  const { requirements, strengthLevel, strengthScore, strengthColor } =
    React.useMemo(() => {
      // ✅ ENTERPRISE: Enhanced requirements
      const hasMinLength = password.length >= minLength;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
      const hasUpperAndLower = hasUppercase && hasLowercase;

      // ✅ ENTERPRISE: Advanced security checks
      const hasNoCommonPatterns = !/(123|abc|password|qwerty)/i.test(password);
      const hasNoPersonalInfo =
        !email ||
        !password
          .toLowerCase()
          .includes((email.split('@')[0] ?? '').toLowerCase());
      const hasNoNameInfo =
        !name || !password.toLowerCase().includes(name.toLowerCase());

      const reqs: PasswordRequirement[] = [
        {
          id: 'length',
          label: `${minLength} or more characters`,
          met: hasMinLength,
          weight: 2,
        },
        {
          id: 'case',
          label: 'Uppercase and lowercase letters',
          met: hasUpperAndLower,
          weight: 2,
        },
        {
          id: 'number',
          label: 'At least one number',
          met: hasNumber,
          weight: 1,
        },
      ];

      // ✅ ENTERPRISE: Add special chars requirement if enabled
      if (requireSpecialChars) {
        reqs.push({
          id: 'special',
          label: 'At least one special character (!@#$%^&*)',
          met: hasSpecialChar,
          weight: 2,
        });
      }

      // ✅ ENTERPRISE: Advanced security requirements
      if (password.length >= 4) {
        // Only show these for longer passwords
        reqs.push({
          id: 'patterns',
          label: 'No common patterns (123, abc, password)',
          met: hasNoCommonPatterns,
          weight: 1,
        });

        if (email) {
          reqs.push({
            id: 'personal',
            label: "Doesn't contain your email",
            met: hasNoPersonalInfo,
            weight: 1,
          });
        }

        if (name) {
          reqs.push({
            id: 'name',
            label: "Doesn't contain your name",
            met: hasNoNameInfo,
            weight: 1,
          });
        }
      }

      // ✅ ENTERPRISE: Calculate strength score
      const totalWeight = reqs.reduce((sum, req) => sum + req.weight, 0);
      const metWeight = reqs
        .filter(req => req.met)
        .reduce((sum, req) => sum + req.weight, 0);
      const score =
        totalWeight > 0 ? Math.round((metWeight / totalWeight) * 100) : 0;

      // ✅ ENTERPRISE: Determine strength level
      let level: StrengthLevel = 'weak';
      if (score >= 90) level = 'strong';
      else if (score >= 70) level = 'good';
      else if (score >= 50) level = 'fair';

      // ✅ ENTERPRISE: Color coding
      const colors = {
        weak: {
          bg: 'bg-red-200',
          text: 'text-red-700',
          progress: 'bg-red-500',
        },
        fair: {
          bg: 'bg-orange-200',
          text: 'text-orange-700',
          progress: 'bg-orange-500',
        },
        good: {
          bg: 'bg-yellow-200',
          text: 'text-yellow-700',
          progress: 'bg-yellow-500',
        },
        strong: {
          bg: 'bg-green-200',
          text: 'text-green-700',
          progress: 'bg-green-500',
        },
      };

      return {
        requirements: reqs,
        strengthLevel: level,
        strengthScore: score,
        strengthColor: colors[level],
      };
    }, [password, minLength, requireSpecialChars, email, name]);

  // ✅ ENTERPRISE: Don't show anything for empty password
  if (!password || password.length === 0) {
    return null;
  }

  // ✅ ENTERPRISE: Minimal variant (original behavior)
  if (variant === 'minimal' && !showAllRequirements) {
    const firstUnmetRequirement = requirements.find(req => !req.met);

    if (!firstUnmetRequirement) {
      // ✅ ENTERPRISE: Show success for strong passwords
      if (strengthLevel === 'strong') {
        return (
          <div
            className={cn(
              'flex items-center gap-1.5 px-1 text-[0.8rem] font-medium text-green-600',
              className
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
            <p>Strong password</p>
          </div>
        );
      }
      return null;
    }

    return (
      <div
        className={cn(
          'flex items-center gap-1.5 px-1 text-[0.8rem] font-medium text-muted-foreground',
          className
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
        <p>{firstUnmetRequirement.label}</p>
      </div>
    );
  }

  // ✅ ENTERPRISE: Progress variant
  if (variant === 'progress' || showProgress) {
    return (
      <div className={cn('space-y-2', className)}>
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Password strength</span>
            <span className={cn('font-medium', strengthColor.text)}>
              {strengthLevel.charAt(0).toUpperCase() + strengthLevel.slice(1)}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                strengthColor.progress
              )}
              style={{ width: `${strengthScore}%` }}
            />
          </div>
        </div>

        {/* Requirements list (if showing all) */}
        {showAllRequirements && (
          <div className="space-y-1">
            {requirements.map(req => (
              <div key={req.id} className="flex items-center gap-2 text-xs">
                {req.met ? (
                  <svg
                    className="h-3 w-3 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-3 w-3 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span
                  className={cn(
                    req.met ? 'text-green-600' : 'text-muted-foreground'
                  )}
                >
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ✅ ENTERPRISE: Detailed variant
  return (
    <div className={cn('space-y-2', className)}>
      <div className="text-xs font-medium text-muted-foreground">
        Password Requirements:
      </div>
      <div className="space-y-1">
        {requirements.map(req => (
          <div key={req.id} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <svg
                className="h-3 w-3 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-3 w-3 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span
              className={cn(
                req.met ? 'text-green-600' : 'text-muted-foreground'
              )}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ✅ ENTERPRISE: Additional utility functions
export function getPasswordStrength(
  password: string,
  options?: {
    requireSpecialChars?: boolean;
    minLength?: number;
    email?: string;
    name?: string;
  }
): {
  score: number;
  level: StrengthLevel;
  suggestions: string[];
} {
  // This would be the same logic as above, extracted for programmatic use
  const suggestions: string[] = [];

  if (password.length < (options?.minLength ?? 8)) {
    // ✅ CORREÇÃO: || → ||
    suggestions.push(`Use at least ${options?.minLength ?? 8} characters`); // ✅ CORREÇÃO: || → ||
  }

  if (!/[A-Z]/.test(password)) {
    suggestions.push('Add uppercase letters');
  }

  if (!/[a-z]/.test(password)) {
    suggestions.push('Add lowercase letters');
  }

  if (!/\d/.test(password)) {
    suggestions.push('Add numbers');
  }

  if (options?.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    suggestions.push('Add special characters');
  }

  // Simplified scoring for utility function
  let score = 0;
  if (password.length >= (options?.minLength ?? 8)) score += 25; // ✅ CORREÇÃO: || → ||
  if (/[A-Z]/.test(password)) score += 20;
  if (/[a-z]/.test(password)) score += 20;
  if (/\d/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;

  let level: StrengthLevel = 'weak';
  if (score >= 90) level = 'strong';
  else if (score >= 70) level = 'good';
  else if (score >= 50) level = 'fair';

  return { score, level, suggestions };
}
