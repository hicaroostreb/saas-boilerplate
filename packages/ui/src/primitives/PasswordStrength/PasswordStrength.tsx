'use client';

import { cn } from '../../utils/cn';

export type PasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordRequirement {
  label: string;
  met: boolean;
  required: boolean;
}

export interface PasswordStrengthProps {
  password: string;
  className?: string;
  showRequirements?: boolean;
  minLength?: number;
  requireSpecialChars?: boolean;
  email?: string;
  name?: string;
  variant?: 'minimal' | 'progress' | 'detailed';
}

/**
 * PasswordStrength component - Visual password strength indicator
 *
 * @example
 * ```
 * function PasswordForm() {
 *   const [password, setPassword] = useState('');
 *
 *   return (
 *     <div>
 *       <PasswordInput
 *         value={password}
 *         onChange={(e) => setPassword(e.target.value)}
 *       />
 *
 *       <PasswordStrength
 *         password={password}
 *         showRequirements={true}
 *         variant="detailed"
 *         minLength={8}
 *         requireSpecialChars={true}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function PasswordStrength({
  password,
  className,
  showRequirements = false,
  minLength = 8,
  requireSpecialChars = false,
  email,
  name,
  variant = 'progress',
}: PasswordStrengthProps): JSX.Element {
  const analysis = analyzePassword(password, {
    minLength,
    requireSpecialChars,
    email: email || undefined,
    name: name || undefined,
  });

  if (variant === 'minimal') {
    return (
      <MinimalView analysis={analysis} className={className || undefined} />
    );
  }

  if (variant === 'detailed') {
    return (
      <DetailedView
        analysis={analysis}
        showRequirements={showRequirements}
        className={className || undefined}
      />
    );
  }

  return (
    <ProgressView
      analysis={analysis}
      showRequirements={showRequirements}
      className={className || undefined}
    />
  );
}

// Analysis function
function analyzePassword(
  password: string,
  options: {
    minLength?: number;
    requireSpecialChars?: boolean;
    email?: string;
    name?: string;
  }
): {
  requirements: PasswordRequirement[];
  level: PasswordStrengthLevel;
  score: number;
} {
  const { minLength = 8, requireSpecialChars = false, email, name } = options;

  const requirements: PasswordRequirement[] = [
    {
      label: `At least ${minLength} characters`,
      met: password.length >= minLength,
      required: true,
    },
    {
      label: 'Contains uppercase letter',
      met: /[A-Z]/.test(password),
      required: false,
    },
    {
      label: 'Contains lowercase letter',
      met: /[a-z]/.test(password),
      required: false,
    },
    {
      label: 'Contains number',
      met: /\d/.test(password),
      required: false,
    },
  ];

  if (requireSpecialChars) {
    requirements.push({
      label: 'Contains special character',
      met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      required: true,
    });
  }

  // ✅ CORREÇÃO: Check for common patterns com null safety
  if (
    email &&
    email.includes('@') &&
    password.toLowerCase().includes(email.split('@')[0]?.toLowerCase() || '')
  ) {
    requirements.push({
      label: 'Does not contain email',
      met: false,
      required: true,
    });
  }

  if (name && password.toLowerCase().includes(name.toLowerCase())) {
    requirements.push({
      label: 'Does not contain name',
      met: false,
      required: true,
    });
  }

  // Calculate score
  const metCount = requirements.filter(req => req.met).length;
  const totalCount = requirements.length;
  const score = (metCount / totalCount) * 100;

  // Determine level
  let level: PasswordStrengthLevel = 'weak';
  if (score >= 80) level = 'strong';
  else if (score >= 60) level = 'good';
  else if (score >= 40) level = 'fair';

  // Required requirements must be met for good+ levels
  const requiredMet = requirements
    .filter(req => req.required)
    .every(req => req.met);
  if (!requiredMet && level !== 'weak') {
    level = 'weak';
  }

  return { requirements, level, score };
}

// View Components
function MinimalView({
  analysis,
  className,
}: {
  analysis: ReturnType<typeof analyzePassword>;
  className?: string;
}): JSX.Element {
  const { level } = analysis;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(index => (
          <div
            key={index}
            className={cn(
              'h-1 w-4 rounded-full transition-colors',
              getStrengthColor(level, index)
            )}
          />
        ))}
      </div>
      <span className={cn('text-xs font-medium', getTextColor(level))}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    </div>
  );
}

// ✅ CORREÇÃO: Adicionar showRequirements na interface
function ProgressView({
  analysis,
  showRequirements = false,
  className,
}: {
  analysis: ReturnType<typeof analyzePassword>;
  showRequirements?: boolean; // ✅ ADICIONAR
  className?: string;
}): JSX.Element {
  const { level, score, requirements } = analysis;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Password strength</span>
          <span className={cn('font-medium', getTextColor(level))}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300 rounded-full',
              getProgressColor(level)
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Requirements */}
      {showRequirements && <RequirementsList requirements={requirements} />}
    </div>
  );
}

// ✅ CORREÇÃO: Adicionar showRequirements na interface
function DetailedView({
  analysis,
  showRequirements: _showRequirements,
  className,
}: {
  analysis: ReturnType<typeof analyzePassword>;
  showRequirements?: boolean; // ✅ ADICIONAR (mesmo que não usado)
  className?: string;
}): JSX.Element {
  const { requirements, level } = analysis;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Password strength:</span>
        <span className={cn('text-sm font-medium', getTextColor(level))}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </span>
      </div>

      <RequirementsList requirements={requirements} />
    </div>
  );
}

function RequirementsList({
  requirements,
}: {
  requirements: PasswordRequirement[];
}): JSX.Element {
  return (
    <ul className="space-y-1">
      {requirements.map((requirement, index) => (
        <li key={index} className="flex items-center gap-2 text-xs">
          <div
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              requirement.met ? 'bg-success' : 'bg-muted-foreground'
            )}
          />
          <span
            className={cn(
              requirement.met ? 'text-success' : 'text-muted-foreground'
            )}
          >
            {requirement.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

// Helper functions
function getStrengthColor(level: PasswordStrengthLevel, index: number): string {
  const colors = {
    weak: ['bg-error', 'bg-muted', 'bg-muted', 'bg-muted'],
    fair: ['bg-warning', 'bg-warning', 'bg-muted', 'bg-muted'],
    good: ['bg-warning', 'bg-warning', 'bg-info', 'bg-muted'],
    strong: ['bg-success', 'bg-success', 'bg-success', 'bg-success'],
  };
  return colors[level][index - 1] || 'bg-muted'; // ✅ CORREÇÃO: fallback
}

function getTextColor(level: PasswordStrengthLevel): string {
  const colors = {
    weak: 'text-error',
    fair: 'text-warning',
    good: 'text-info',
    strong: 'text-success',
  };
  return colors[level];
}

function getProgressColor(level: PasswordStrengthLevel): string {
  const colors = {
    weak: 'bg-error',
    fair: 'bg-warning',
    good: 'bg-info',
    strong: 'bg-success',
  };
  return colors[level];
}
