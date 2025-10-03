'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../primitives/Button';
import { ErrorAlert } from '../primitives/ErrorAlert';
import { PasswordInput } from '../primitives/PasswordInput';
import { PasswordStrength } from '../primitives/PasswordStrength';
import { cn } from '../utils/cn';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordFormProps {
  onResetPassword: (data: ResetPasswordFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  token?: string;
  email?: string;
  organizationSlug?: string | null;
  showPasswordStrength?: boolean;
  signInUrl?: string;
}

/**
 * ResetPasswordForm component - Complete password reset flow
 *
 * @example
 * ```
 * function ResetPasswordPage() {
 *   const { token } = useSearchParams();
 *   const [isLoading, setIsLoading] = useState(false);
 *   const [error, setError] = useState<string | null>(null);
 *
 *   const handleResetPassword = async (data: ResetPasswordFormData) => {
 *     setIsLoading(true);
 *     try {
 *       await authService.resetPassword(token, data.password);
 *       router.push('/auth/sign-in?reset=success');
 *     } catch (err) {
 *       setError('Failed to reset password');
 *       throw err;
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 *
 *   return (
 *     <ResetPasswordForm
 *       onResetPassword={handleResetPassword}
 *       isLoading={isLoading}
 *       error={error}
 *       token={token}
 *       showPasswordStrength={true}
 *     />
 *   );
 * }
 * ```
 */
export function ResetPasswordForm({
  onResetPassword,
  isLoading = false,
  error: externalError,
  token,
  email,
  organizationSlug,
  showPasswordStrength = true,
  signInUrl,
}: ResetPasswordFormProps): JSX.Element {
  const [isSuccess, setIsSuccess] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password', '');
  const displayError = externalError ?? internalError;
  const contextualSignInUrl =
    signInUrl ??
    (organizationSlug
      ? `/auth/sign-in?org=${organizationSlug}`
      : '/auth/sign-in');

  const handleFormSubmit = async (
    data: ResetPasswordFormData
  ): Promise<void> => {
    setInternalError(null);

    try {
      await onResetPassword(data);
      setIsSuccess(true);
    } catch (_error: unknown) {
      const errorMessage =
        _error instanceof Error
          ? _error.message
          : 'Failed to reset password. Please try again.';
      setInternalError(errorMessage);
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <AuthFormContainer
        title="Password reset successful"
        subtitle="Your password has been successfully reset. You can now sign in with your new password."
        icon={<SuccessIcon />}
        variant="success"
      >
        <div className="space-y-4">
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 h-4 w-4 text-success flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-success">Password Updated</p>
                <p className="text-success/80 mt-1">
                  Your account is now secured with the new password.
                </p>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => (window.location.href = contextualSignInUrl)}
          >
            Continue to Sign In
          </Button>

          <div className="text-center">
            <a
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              href="/auth/forgot-password"
            >
              Reset a different password?
            </a>
          </div>
        </div>
      </AuthFormContainer>
    );
  }

  // Token validation
  if (!token) {
    return (
      <AuthFormContainer
        title="Invalid reset link"
        subtitle="This password reset link is invalid or has expired. Please request a new one."
      >
        <div className="space-y-4">
          <div className="p-4 bg-error/10 rounded-lg border border-error/20">
            <div className="flex items-start gap-2">
              <ErrorIcon className="mt-0.5 h-4 w-4 text-error flex-shrink-0" />
              <div className="text-sm text-error">
                The reset link may have expired or been used already.
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => (window.location.href = '/auth/forgot-password')}
          >
            Request New Reset Link
          </Button>

          <div className="text-center">
            <a
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              href={contextualSignInUrl}
            >
              Back to Sign In
            </a>
          </div>
        </div>
      </AuthFormContainer>
    );
  }

  // Main Form
  return (
    <AuthFormContainer
      title={
        organizationSlug
          ? `Reset your ${organizationSlug} password`
          : 'Reset your password'
      }
      subtitle={
        email
          ? `Create a new password for ${email}`
          : 'Please enter your new password below.'
      }
    >
      <ErrorAlert
        message={displayError}
        className={displayError ? undefined : undefined}
      />

      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <div className="space-y-2">
          <PasswordInput
            id="password"
            placeholder="Enter new password"
            disabled={isLoading}
            error={Boolean(errors.password)}
            helperText={errors.password?.message || undefined}
            {...register('password')}
          />

          {showPasswordStrength && password && (
            <PasswordStrength
              password={password}
              email={email}
              variant="progress"
              showRequirements={true}
            />
          )}
        </div>

        <PasswordInput
          id="confirmPassword"
          placeholder="Confirm new password"
          disabled={isLoading}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message || undefined}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Updating password...' : 'Update Password'}
        </Button>
      </form>

      {/* Security Tips */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium text-sm mb-2">Password Security Tips</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-muted-foreground" />
            Use a combination of letters, numbers, and symbols
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-muted-foreground" />
            Avoid using personal information
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-muted-foreground" />
            Don&apos;t reuse passwords from other accounts
          </li>
        </ul>
      </div>

      <div className="text-center">
        <a
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          href={contextualSignInUrl}
        >
          Back to Sign In
        </a>
      </div>
    </AuthFormContainer>
  );
}

// Helper Components (reuse from forgot-password-form or create shared)
function AuthFormContainer({
  title,
  subtitle,
  icon,
  variant = 'default',
  children,
  className,
}: {
  title: string;
  subtitle: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'success';
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2',
        className
      )}
    >
      <div className="flex flex-col space-y-1.5 p-6">
        {icon && variant === 'success' && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
              {icon}
            </div>
            <h3 className="font-semibold tracking-tight text-base lg:text-lg">
              {title}
            </h3>
          </div>
        )}
        {(!icon || variant === 'default') && (
          <h3 className="font-semibold tracking-tight text-base lg:text-lg">
            {title}
          </h3>
        )}
        <div className="text-sm text-muted-foreground">{subtitle}</div>
      </div>

      <div className="p-6 pt-0 flex flex-col gap-4">{children}</div>
    </div>
  );
}

// Icons
function SuccessIcon(): JSX.Element {
  return (
    <svg
      className="w-5 h-5 text-success"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
