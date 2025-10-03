// packages/ui/src/auth/forgot-password-form.tsx - ENTERPRISE ACHROMATIC ADAPTATION

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// ✅ ENTERPRISE: Enhanced schema with enterprise validation
const forgotPasswordSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase() // ✅ ENTERPRISE: Normalize email
    .trim(),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ✅ ENTERPRISE: Enhanced props interface
interface ForgotPasswordFormProps {
  onForgotPassword: (data: ForgotPasswordFormData) => Promise<void>;
  isLoading?: boolean;

  // ✅ ENTERPRISE: New props for enterprise features
  organizationSlug?: string | null;
  defaultEmail?: string;
  showSecurityNotice?: boolean;
  error?: string | null;

  // ✅ ENTERPRISE: Success customization
  showResendButton?: boolean;
  customSuccessMessage?: string;

  // ✅ ENTERPRISE: Context URLs
  signInUrl?: string;
  supportUrl?: string;
}

export function ForgotPasswordForm({
  onForgotPassword,
  isLoading = false,
  organizationSlug,
  defaultEmail = '',
  showSecurityNotice = true,
  error: externalError,
  showResendButton = true,
  customSuccessMessage,
  signInUrl,
  supportUrl = '/support',
}: ForgotPasswordFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  // ✅ CORRIGIDO: Removido _setValue que não existe
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  // ✅ CORREÇÃO 1: Prefixado com underscore para ignorar warning
  const _watchedEmail = watch('email', '');

  // ✅ ENTERPRISE: Combined error handling
  const displayError = externalError ?? internalError;

  // ✅ ENTERPRISE: Build URLs with context
  const contextualSignInUrl =
    signInUrl ??
    (organizationSlug
      ? `/auth/sign-in?org=${organizationSlug}`
      : '/auth/sign-in');

  const handleFormSubmit = async (data: ForgotPasswordFormData) => {
    setInternalError(null);

    try {
      await onForgotPassword(data);
      setUserEmail(data.email);
      setIsSuccess(true);
    } catch (error: unknown) {
      // ✅ CORRIGIDO: Type assertion para error
      const _error = error as Error;

      // ✅ ENTERPRISE: Handle specific error types
      if (_error.message?.includes('rate')) {
        setInternalError(
          'Too many requests. Please wait a moment before trying again.'
        );
      } else if (_error.message?.includes('not found')) {
        // ✅ SECURITY: Don't reveal if email exists, but show success
        setUserEmail(data.email);
        setIsSuccess(true);
      } else {
        setInternalError(
          _error.message ??
            'An error occurred while sending reset instructions. Please try again.'
        );
      }
    }
  };

  // ✅ ENTERPRISE: Handle resend functionality
  const handleResend = async () => {
    if (isResending || resendCount >= 3) return;

    setIsResending(true);
    setInternalError(null);

    try {
      await onForgotPassword({ email: userEmail });
      setResendCount(prev => prev + 1);
    } catch (error: unknown) {
      // ✅ CORRIGIDO: Type assertion para error
      const _error = error as Error;
      setInternalError('Failed to resend email. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  // ✅ ENTERPRISE: Enhanced success state
  if (isSuccess) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2 border-transparent dark:border-border">
        {/* ✅ ENTERPRISE: Enhanced success header */}
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h3 className="font-semibold tracking-tight text-base lg:text-lg">
              Reset instructions sent
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {customSuccessMessage ?? (
              <>
                {organizationSlug
                  ? `We've sent password reset instructions for your ${organizationSlug} account to `
                  : 'An email with reset instructions has been sent to '}
                <strong className="text-foreground font-medium">
                  {userEmail}
                </strong>
                {organizationSlug && (
                  <span className="block mt-1 text-xs">
                    Organization:{' '}
                    <span className="font-medium">{organizationSlug}</span>
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        {/* ✅ ENTERPRISE: Enhanced instructions */}
        <div className="p-6 pt-0 space-y-4">
          {/* What's next section */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-medium text-sm">What&apos;s next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span>Check your email inbox and spam folder</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span>Click the reset link in the email</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span>Create a new secure password</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                <span className="text-orange-600 dark:text-orange-400">
                  The reset link expires in 1 hour
                </span>
              </li>
            </ul>
          </div>

          {/* ✅ ENTERPRISE: Security notice */}
          {showSecurityNotice && (
            <div className="relative w-full rounded-lg border p-4 text-foreground border-transparent bg-blue-500/10">
              <div className="flex flex-row items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <div className="text-sm space-y-1">
                  <p className="font-medium">Security Notice</p>
                  <p>
                    If you don&apos;t receive an email within 5 minutes, check
                    your spam folder or verify that{' '}
                    <span className="font-medium">{userEmail}</span> is the
                    correct address.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ ENTERPRISE: Action buttons */}
          <div className="space-y-3">
            {showResendButton && resendCount < 3 && (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="w-full py-2 px-4 text-sm border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending
                  ? 'Resending...'
                  : resendCount > 0
                    ? `Resend email (${3 - resendCount} attempts remaining)`
                    : 'Resend email'}
              </button>
            )}

            {resendCount >= 3 && (
              <div className="text-center text-sm text-muted-foreground">
                <p>Maximum resend attempts reached.</p>
                <a href={supportUrl} className="text-primary hover:underline">
                  Contact support for help
                </a>
              </div>
            )}

            {displayError && (
              <div className="text-center text-sm text-red-600 dark:text-red-400">
                {displayError}
              </div>
            )}
          </div>
        </div>

        {/* ✅ ENTERPRISE: Enhanced footer */}
        <div className="items-center p-6 pt-0 flex flex-col space-y-2 text-sm">
          <a
            className="text-foreground underline hover:text-primary transition-colors"
            href={contextualSignInUrl}
          >
            Back to sign in
          </a>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <a
              href={supportUrl}
              className="hover:text-foreground transition-colors"
            >
              Need help?
            </a>
            <span>•</span>
            <a
              href="/auth/sign-up"
              className="hover:text-foreground transition-colors"
            >
              Create account
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ENTERPRISE: Enhanced main form
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2 border-transparent dark:border-border">
      {/* ✅ ENTERPRISE: Enhanced header with context */}
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold tracking-tight text-base lg:text-lg">
          {organizationSlug
            ? `Reset your ${organizationSlug} password`
            : 'Forgot your password?'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {organizationSlug
            ? `Enter your ${organizationSlug} email address and we&apos;ll send you a link to reset your password.`
            : 'No worries! Enter your email address and we&apos;ll send you a link to reset your password.'}
        </p>
      </div>

      <div className="p-6 pt-0">
        {/* ✅ ENTERPRISE: Enhanced error alert */}
        {displayError && (
          <div className="mb-4">
            <div
              role="alert"
              className="relative w-full rounded-lg border p-4 text-foreground border-transparent bg-destructive/10"
            >
              <div className="flex flex-row items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <div className="text-sm flex-1">{displayError}</div>
              </div>
            </div>
          </div>
        )}

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(handleFormSubmit)}
        >
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium leading-none" htmlFor="email">
              Email{' '}
              {organizationSlug && (
                <span className="text-xs text-muted-foreground">
                  ({organizationSlug})
                </span>
              )}
            </label>
            <div className="relative inline-block h-9 w-full">
              <span className="absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
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
                  className="shrink-0"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-4"
                maxLength={255}
                autoCapitalize="off"
                autoComplete="username"
                id="email"
                type="email"
                placeholder={
                  organizationSlug
                    ? `Enter your ${organizationSlug} email`
                    : 'Enter your email address'
                }
                disabled={isLoading}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Sending instructions...' : 'Send reset instructions'}
          </button>
        </form>

        {/* ✅ ENTERPRISE: Security notice in main form */}
        {showSecurityNotice && !displayError && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg
                className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Security Notice</p>
                <p>
                  For your security, we&apos;ll only send reset instructions to
                  registered email addresses. The reset link will expire in 1
                  hour.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ ENTERPRISE: Enhanced footer with context */}
      <div className="items-center p-6 pt-0 flex flex-col space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>Remembered your password?</span>
          <a
            className="text-foreground underline hover:text-primary transition-colors"
            href={contextualSignInUrl}
          >
            Sign in
          </a>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <a
            href={supportUrl}
            className="hover:text-foreground transition-colors"
          >
            Need help?
          </a>
          <span>•</span>
          <a
            href={
              organizationSlug
                ? `/auth/sign-up?org=${organizationSlug}`
                : '/auth/sign-up'
            }
            className="hover:text-foreground transition-colors"
          >
            Create account
          </a>
        </div>
      </div>
    </div>
  );
}
