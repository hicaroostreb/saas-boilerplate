'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../primitives/Button';
import { ErrorAlert } from '../primitives/ErrorAlert';
import { FormField } from '../primitives/FormField';
import { PasswordInput } from '../primitives/PasswordInput';
import { PasswordStrength } from '../primitives/PasswordStrength';
import { SocialButton } from '../primitives/SocialButton';
import { cn } from '../utils/cn';

const signUpSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
    })
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .trim(),
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  terms: z
    .boolean()
    .refine(val => val === true, 'You must accept the terms and conditions'),
  inviteCode: z.string().optional(), // ✅ ADICIONAR para resolver erro do register
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export interface SignUpFormProps {
  onSignUp: (data: SignUpFormData) => Promise<void>;
  onSocialSignUp?: (provider: string) => Promise<void>;
  isLoading?: boolean;
  socialLoading?: Record<string, boolean>;
  error?: string | null;
  organizationSlug?: string | null;
  defaultEmail?: string;
  showSocialAuth?: boolean;
  socialProviders?: ('google' | 'microsoft' | 'github' | 'apple')[];
  showPasswordStrength?: boolean;
  signInUrl?: string;
  termsUrl?: string;
  privacyUrl?: string;
  requireInviteCode?: boolean;
}

/**
 * SignUpForm component - Complete user registration flow
 *
 * @example
 * ```
 * function SignUpPage() {
 *   const [isLoading, setIsLoading] = useState(false);
 *   const [error, setError] = useState<string | null>(null);
 *   const [socialLoading, setSocialLoading] = useState<Record<string, boolean>>({});
 *
 *   const handleSignUp = async (data: SignUpFormData) => {
 *     setIsLoading(true);
 *     try {
 *       await authService.signUp(data);
 *       router.push('/auth/verify-email');
 *     } catch (err) {
 *       setError('Failed to create account');
 *       throw err;
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 *
 *   const handleSocialSignUp = async (provider: string) => {
 *     setSocialLoading(prev => ({ ...prev, [provider]: true }));
 *     try {
 *       await authService.signUpWithProvider(provider);
 *     } catch (err) {
 *       setError(`Failed to sign up with ${provider}`);
 *     } finally {
 *       setSocialLoading(prev => ({ ...prev, [provider]: false }));
 *     }
 *   };
 *
 *   return (
 *     <SignUpForm
 *       onSignUp={handleSignUp}
 *       onSocialSignUp={handleSocialSignUp}
 *       isLoading={isLoading}
 *       socialLoading={socialLoading}
 *       error={error}
 *       organizationSlug="acme-corp"
 *       showSocialAuth={true}
 *       showPasswordStrength={true}
 *     />
 *   );
 * }
 * ```
 */
export function SignUpForm({
  onSignUp,
  onSocialSignUp,
  isLoading = false,
  socialLoading = {},
  error: externalError,
  organizationSlug,
  defaultEmail = '',
  showSocialAuth = true,
  socialProviders = ['google', 'microsoft'],
  showPasswordStrength = true,
  signInUrl,
  termsUrl = '/legal/terms',
  privacyUrl = '/legal/privacy',
  requireInviteCode = false,
}: SignUpFormProps): JSX.Element {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: defaultEmail,
      terms: false,
    },
  });

  const password = watch('password', '');
  const email = watch('email', '');
  const displayError = externalError ?? internalError;
  const contextualSignInUrl =
    signInUrl ??
    (organizationSlug
      ? `/auth/sign-in?org=${organizationSlug}`
      : '/auth/sign-in');

  const handleFormSubmit = async (data: SignUpFormData): Promise<void> => {
    setInternalError(null);

    try {
      await onSignUp(data);
      setUserEmail(data.email);
      setIsSuccess(true);
    } catch (_error: unknown) {
      const errorMessage =
        _error instanceof Error
          ? _error.message
          : 'Failed to create account. Please try again.';
      setInternalError(errorMessage);
    }
  };

  const handleSocialAuth = async (provider: string): Promise<void> => {
    if (!onSocialSignUp) return;

    setInternalError(null);

    try {
      await onSocialSignUp(provider);
    } catch (_error: unknown) {
      const errorMessage =
        _error instanceof Error
          ? _error.message
          : `Failed to sign up with ${provider}. Please try again.`;
      setInternalError(errorMessage);
    }
  };

  // Success State - Email Verification
  if (isSuccess) {
    return (
      <AuthFormContainer
        title="Check your email"
        subtitle={
          <>
            We&apos;ve sent a verification link to{' '}
            <strong className="text-foreground">{userEmail}</strong>
            {organizationSlug && (
              <span className="block mt-1 text-xs">
                Organization:{' '}
                <span className="font-medium">{organizationSlug}</span>
              </span>
            )}
          </>
        }
        icon={<EmailSentIcon />}
        variant="success"
      >
        <div className="space-y-4">
          {/* Instructions */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-medium text-sm">Next steps:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Check your email inbox (and spam folder)</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Click the verification link in the email</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                <span>The verification link expires in 24 hours</span>
              </li>
            </ul>
          </div>

          {/* Resend Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSuccess(false);
              // Could trigger resend verification email
            }}
          >
            Resend verification email
          </Button>

          {/* Sign In Link */}
          <div className="text-center text-sm text-muted-foreground">
            Already verified?{' '}
            <a
              className="text-foreground underline hover:text-primary transition-colors"
              href={contextualSignInUrl}
            >
              Sign in to your account
            </a>
          </div>
        </div>
      </AuthFormContainer>
    );
  }

  return (
    <AuthFormContainer
      title={
        organizationSlug ? `Join ${organizationSlug}` : 'Create your account'
      }
      subtitle={
        organizationSlug
          ? `Get started with your ${organizationSlug} account`
          : 'Enter your information to get started'
      }
    >
      <ErrorAlert
        message={displayError}
        className={displayError ? undefined : undefined}
      />

      {/* Social Authentication */}
      {showSocialAuth && onSocialSignUp && socialProviders.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            {socialProviders.map(provider => (
              <SocialButton
                key={provider}
                provider={provider}
                onClick={() => handleSocialAuth(provider)}
                disabled={
                  isLoading || Object.values(socialLoading).some(Boolean)
                }
                loading={Boolean(socialLoading[provider]) || undefined}
              />
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
        </div>
      )}

      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <FormField
          id="name"
          type="text"
          label="Full Name"
          icon={<UserIcon />}
          placeholder="Enter your full name"
          autoComplete="name"
          disabled={isLoading}
          error={!!errors.name}
          helperText={errors.name?.message || undefined}
          {...register('name')}
        />

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
          helperText={errors.email?.message || undefined}
          {...register('email')}
        />

        <div className="space-y-2">
          <PasswordInput
            id="password"
            placeholder="Create a password"
            autoComplete="new-password"
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

        {/* Invite Code (if required) */}
        {requireInviteCode && (
          <FormField
            id="inviteCode"
            type="text"
            label="Invite Code"
            icon={<KeyIcon />}
            placeholder="Enter your invite code"
            disabled={isLoading}
            {...register('inviteCode')}
          />
        )}

        {/* ✅ TERMS CHECKBOX SUBSTITUÍDO POR INPUT NATIVO */}
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="terms"
              className="mt-0.5 rounded border-border"
              disabled={isLoading}
              {...register('terms')}
            />
            <label htmlFor="terms" className="text-sm leading-relaxed">
              I agree to the{' '}
              <a href={termsUrl} className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href={privacyUrl} className="text-primary hover:underline">
                Privacy Policy
              </a>
              {organizationSlug && (
                <span className="block text-xs text-muted-foreground mt-1">
                  For {organizationSlug} organization
                </span>
              )}
            </label>
          </div>
          {errors.terms && (
            <p className="text-xs text-error ml-6">{errors.terms.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      {/* Sign In Link */}
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <a
          className="text-foreground underline hover:text-primary transition-colors"
          href={contextualSignInUrl}
        >
          Sign in
        </a>
      </div>
    </AuthFormContainer>
  );
}

// Helper Components (shared)
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
            <div className="w-8 h-8 bg-info/10 rounded-full flex items-center justify-center">
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
function UserIcon(): JSX.Element {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

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

function KeyIcon(): JSX.Element {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  );
}

function EmailSentIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5 text-info" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  );
}
