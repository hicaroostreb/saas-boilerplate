'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../primitives/Button';
import { ErrorAlert } from '../primitives/ErrorAlert';
import { FormField } from '../primitives/FormField';
import { cn } from '../utils/cn';

const forgotPasswordSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordFormProps {
  onForgotPassword: (data: ForgotPasswordFormData) => Promise<void>;
  isLoading?: boolean;
  organizationSlug?: string | null;
  defaultEmail?: string;
  showSecurityNotice?: boolean;
  error?: string | null;
  showResendButton?: boolean;
  customSuccessMessage?: string;
  signInUrl?: string;
  supportUrl?: string;
}

/**
 * ForgotPasswordForm component - Complete forgot password flow
 *
 * @example
 * ```
 * function ForgotPasswordPage() {
 *   const [isLoading, setIsLoading] = useState(false);
 *   const [error, setError] = useState<string | null>(null);
 *
 *   const handleForgotPassword = async (data: { email: string }) => {
 *     setIsLoading(true);
 *     try {
 *       await authService.sendPasswordReset(data.email);
 *     } catch (err) {
 *       setError('Failed to send reset email');
 *       throw err;
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 *
 *   return (
 *     <ForgotPasswordForm
 *       onForgotPassword={handleForgotPassword}
 *       isLoading={isLoading}
 *       error={error}
 *       organizationSlug="acme-corp"
 *       showSecurityNotice={true}
 *     />
 *   );
 * }
 * ```
 */
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
}: ForgotPasswordFormProps): JSX.Element {
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  const displayError = externalError ?? internalError;
  const contextualSignInUrl =
    signInUrl ??
    (organizationSlug
      ? `/auth/sign-in?org=${organizationSlug}`
      : '/auth/sign-in');

  const handleFormSubmit = async (
    data: ForgotPasswordFormData
  ): Promise<void> => {
    setInternalError(null);

    try {
      await onForgotPassword(data);
      setUserEmail(data.email);
      setIsSuccess(true);
    } catch (_error: unknown) {
      const errorMessage =
        _error instanceof Error
          ? _error.message
          : 'An error occurred while sending reset instructions. Please try again.';

      if (errorMessage.includes('rate')) {
        setInternalError(
          'Too many requests. Please wait a moment before trying again.'
        );
      } else if (errorMessage.includes('not found')) {
        // Security: Don't reveal if email exists, show success
        setUserEmail(data.email);
        setIsSuccess(true);
      } else {
        setInternalError(errorMessage);
      }
    }
  };

  const handleResend = async (): Promise<void> => {
    if (isResending || resendCount >= 3) return;

    setIsResending(true);
    setInternalError(null);

    try {
      await onForgotPassword({ email: userEmail });
      setResendCount(prev => prev + 1);
    } catch (_error: unknown) {
      setInternalError('Failed to resend email. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <AuthFormContainer
        title="Reset instructions sent"
        subtitle={
          customSuccessMessage ?? (
            <>
              {organizationSlug
                ? `We&apos;ve sent password reset instructions for your ${organizationSlug} account to `
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
          )
        }
        icon={<SuccessIcon />}
        variant="success"
      >
        {/* Instructions */}
        <InstructionsCard />

        {/* Security Notice */}
        {showSecurityNotice && <SecurityNotice userEmail={userEmail} />}

        {/* Action Buttons */}
        <div className="space-y-3">
          {showResendButton && resendCount < 3 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={isResending}
              loading={isResending}
            >
              {resendCount > 0
                ? `Resend email (${3 - resendCount} attempts remaining)`
                : 'Resend email'}
            </Button>
          )}

          {resendCount >= 3 && <ResendLimitReached supportUrl={supportUrl} />}

          <ErrorAlert message={displayError} />
        </div>

        {/* Footer */}
        <FormFooter
          primaryLink={{ href: contextualSignInUrl, label: 'Back to sign in' }}
          secondaryLinks={[
            { href: supportUrl, label: 'Need help?' },
            { href: '/auth/sign-up', label: 'Create account' },
          ]}
        />
      </AuthFormContainer>
    );
  }

  // Main Form
  return (
    <AuthFormContainer
      title={
        organizationSlug
          ? `Reset your ${organizationSlug} password`
          : 'Forgot your password?'
      }
      subtitle={
        organizationSlug
          ? `Enter your ${organizationSlug} email address and we&apos;ll send you a link to reset your password.`
          : 'No worries! Enter your email address and we&apos;ll send you a link to reset your password.'
      }
    >
      <ErrorAlert message={displayError} />

      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <FormField
          id="email"
          type="email"
          label="Email"
          icon={<EmailIcon />}
          organizationContext={organizationSlug || undefined}
          placeholder={
            organizationSlug
              ? `Enter your ${organizationSlug} email`
              : 'Enter your email address'
          }
          autoComplete="username"
          disabled={isLoading}
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Sending instructions...' : 'Send reset instructions'}
        </Button>
      </form>

      {/* Security Notice in Main Form */}
      {showSecurityNotice && !displayError && <SecurityNoticeCard />}

      {/* Footer */}
      <FormFooter>
        <span>Remembered your password?</span>
        <a
          className="ml-1 text-foreground underline hover:text-primary transition-colors"
          href={contextualSignInUrl}
        >
          Sign in
        </a>
      </FormFooter>

      <FormSecondaryLinks
        links={[
          { href: supportUrl, label: 'Need help?' },
          {
            href: organizationSlug
              ? `/auth/sign-up?org=${organizationSlug}`
              : '/auth/sign-up',
            label: 'Create account',
          },
        ]}
      />
    </AuthFormContainer>
  );
}

// Helper Components
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

function InstructionsCard(): JSX.Element {
  return (
    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
      <h4 className="font-medium text-sm">What&apos;s next?</h4>
      <ul className="text-sm text-muted-foreground space-y-1">
        <InstructionItem icon="primary">
          Check your email inbox and spam folder
        </InstructionItem>
        <InstructionItem icon="primary">
          Click the reset link in the email
        </InstructionItem>
        <InstructionItem icon="primary">
          Create a new secure password
        </InstructionItem>
        <InstructionItem icon="warning">
          The reset link expires in 1 hour
        </InstructionItem>
      </ul>
    </div>
  );
}

function InstructionItem({
  icon,
  children,
}: {
  icon: 'primary' | 'warning';
  children: React.ReactNode;
}): JSX.Element {
  const dotColor = icon === 'warning' ? 'bg-warning' : 'bg-primary';
  const textColor = icon === 'warning' ? 'text-warning' : '';

  return (
    <li className={cn('flex items-center space-x-2', textColor)}>
      <div className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />
      <span>{children}</span>
    </li>
  );
}

function SecurityNotice({ userEmail }: { userEmail: string }): JSX.Element {
  return (
    <div className="rounded-lg border border-info/20 bg-info/10 p-4">
      <div className="flex items-start gap-2">
        <InfoIcon className="mt-0.5 h-4 w-4 text-info flex-shrink-0" />
        <div className="text-sm space-y-1">
          <p className="font-medium">Security Notice</p>
          <p>
            If you don&apos;t receive an email within 5 minutes, check your spam
            folder or verify that{' '}
            <span className="font-medium">{userEmail}</span> is the correct
            address.
          </p>
        </div>
      </div>
    </div>
  );
}

function SecurityNoticeCard(): JSX.Element {
  return (
    <div className="p-3 bg-muted/50 rounded-lg">
      <div className="flex items-start space-x-2">
        <SecurityIcon className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Security Notice</p>
          <p>
            For your security, we&apos;ll only send reset instructions to
            registered email addresses. The reset link will expire in 1 hour.
          </p>
        </div>
      </div>
    </div>
  );
}

function ResendLimitReached({
  supportUrl,
}: {
  supportUrl: string;
}): JSX.Element {
  return (
    <div className="text-center text-sm text-muted-foreground">
      <p>Maximum resend attempts reached.</p>
      <a href={supportUrl} className="text-primary hover:underline">
        Contact support for help
      </a>
    </div>
  );
}

function FormFooter({
  primaryLink,
  secondaryLinks,
  children,
}: {
  primaryLink?: { href: string; label: string };
  secondaryLinks?: { href: string; label: string }[];
  children?: React.ReactNode;
}): JSX.Element {
  if (children) {
    return (
      <div className="flex justify-center text-sm text-muted-foreground">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2 text-sm">
      {primaryLink && (
        <a
          className="text-foreground underline hover:text-primary transition-colors"
          href={primaryLink.href}
        >
          {primaryLink.label}
        </a>
      )}
      {secondaryLinks && <FormSecondaryLinks links={secondaryLinks} />}
    </div>
  );
}

function FormSecondaryLinks({
  links,
}: {
  links: { href: string; label: string }[];
}): JSX.Element {
  return (
    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
      {links.map((link, index) => (
        <Fragment key={link.href}>
          <a
            href={link.href}
            className="hover:text-foreground transition-colors"
          >
            {link.label}
          </a>
          {index < links.length - 1 && <span>•</span>}
        </Fragment>
      ))}
    </div>
  );
}

// Icons
function EmailIcon(): JSX.Element {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function SuccessIcon(): JSX.Element {
  return (
    <svg
      className="w-5 h-5 text-success"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function SecurityIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
