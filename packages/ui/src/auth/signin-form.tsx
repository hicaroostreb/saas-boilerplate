'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../primitives/Button';
import { ErrorAlert } from '../primitives/ErrorAlert';
import { FormField } from '../primitives/FormField';
import { PasswordInput } from '../primitives/PasswordInput';
import { SocialButton } from '../primitives/SocialButton';
import { cn } from '../utils/cn';

const signInSchema = z.object({
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
    .min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

export interface SignInFormProps {
  onSignIn: (data: SignInFormData) => Promise<void>;
  onSocialSignIn?: (provider: string) => Promise<void>;
  isLoading?: boolean;
  socialLoading?: Record<string, boolean>;
  error?: string | null | ((error: unknown) => string);
  organizationSlug?: string | null;
  defaultEmail?: string;
  showSocialAuth?: boolean;
  socialProviders?: ('google' | 'microsoft' | 'github' | 'apple')[];
  forgotPasswordUrl?: string;
  signUpUrl?: string;
  showRememberMe?: boolean;
}

/**
 * SignInForm component - Complete sign in flow
 *
 * @example
 * ```
 * function SignInPage() {
 *   const [isLoading, setIsLoading] = useState(false);
 *   const [error, setError] = useState<string | null>(null);
 *   const [socialLoading, setSocialLoading] = useState<Record<string, boolean>>({});
 *
 *   const handleSignIn = async (data: SignInFormData) => {
 *     setIsLoading(true);
 *     try {
 *       await authService.signIn(data.email, data.password);
 *       router.push('/dashboard');
 *     } catch (err) {
 *       setError('Invalid email or password');
 *       throw err;
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 *
 *   const handleSocialSignIn = async (provider: string) => {
 *     setSocialLoading(prev => ({ ...prev, [provider]: true }));
 *     try {
 *       await authService.signInWithProvider(provider);
 *     } catch (err) {
 *       setError(`Failed to sign in with ${provider}`);
 *     } finally {
 *       setSocialLoading(prev => ({ ...prev, [provider]: false }));
 *     }
 *   };
 *
 *   return (
 *     <SignInForm
 *       onSignIn={handleSignIn}
 *       onSocialSignIn={handleSocialSignIn}
 *       isLoading={isLoading}
 *       socialLoading={socialLoading}
 *       error={error}
 *       organizationSlug="acme-corp"
 *       showSocialAuth={true}
 *     />
 *   );
 * }
 * ```
 */
export function SignInForm({
  onSignIn,
  onSocialSignIn,
  isLoading = false,
  socialLoading = {},
  error: externalError,
  organizationSlug,
  defaultEmail = '',
  showSocialAuth = true,
  socialProviders = ['google', 'microsoft'],
  forgotPasswordUrl,
  signUpUrl,
  showRememberMe = false,
}: SignInFormProps): JSX.Element {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  // Handle error prop that can be string or function
  const getDisplayError = (): string | null => {
    if (typeof externalError === 'function') {
      return externalError(new Error('Sign in error'));
    }
    return externalError ?? internalError;
  };

  const displayError = getDisplayError();
  const contextualForgotPasswordUrl =
    forgotPasswordUrl ??
    (organizationSlug
      ? `/auth/forgot-password?org=${organizationSlug}`
      : '/auth/forgot-password');
  const contextualSignUpUrl =
    signUpUrl ??
    (organizationSlug
      ? `/auth/sign-up?org=${organizationSlug}`
      : '/auth/sign-up');

  const handleFormSubmit = async (data: SignInFormData): Promise<void> => {
    setInternalError(null);

    try {
      await onSignIn(data);
    } catch (_error: unknown) {
      const errorMessage =
        _error instanceof Error
          ? _error.message
          : 'Sign in failed. Please check your credentials and try again.';
      setInternalError(errorMessage);
    }
  };

  const handleSocialAuth = async (provider: string): Promise<void> => {
    if (!onSocialSignIn) return;

    setInternalError(null);

    try {
      await onSocialSignIn(provider);
    } catch (_error: unknown) {
      const errorMessage =
        _error instanceof Error
          ? _error.message
          : `Failed to sign in with ${provider}. Please try again.`;
      setInternalError(errorMessage);
    }
  };

  return (
    <AuthFormContainer
      title={
        organizationSlug ? `Sign in to ${organizationSlug}` : 'Welcome back'
      }
      subtitle={
        organizationSlug
          ? `Enter your ${organizationSlug} credentials to continue`
          : 'Enter your email and password to sign in to your account'
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

        <div className="space-y-2">
          <PasswordInput
            id="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isLoading}
            error={Boolean(errors.password)}
            helperText={errors.password?.message || undefined}
            {...register('password')}
          />

          <div className="flex items-center justify-between">
            {showRememberMe && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-border"
                />
                Remember me
              </label>
            )}

            <a
              className="text-sm text-primary hover:text-primary/80 transition-colors ml-auto"
              href={contextualForgotPasswordUrl}
            >
              Forgot password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      {/* Social Authentication */}
      {showSocialAuth && onSocialSignIn && socialProviders.length > 0 && (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {socialProviders.map(provider => (
              <SocialButton
                key={provider}
                provider={provider}
                onClick={() => handleSocialAuth(provider)}
                disabled={
                  isLoading || Object.values(socialLoading).some(Boolean)
                }
                loading={Boolean(socialLoading[provider])}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sign Up Link */}
      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <a
          className="text-foreground underline hover:text-primary transition-colors"
          href={contextualSignUpUrl}
        >
          Sign up
        </a>
      </div>
    </AuthFormContainer>
  );
}

// Helper Components (shared with other auth forms)
function AuthFormContainer({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle: React.ReactNode;
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
        <h3 className="font-semibold tracking-tight text-base lg:text-lg">
          {title}
        </h3>
        <div className="text-sm text-muted-foreground">{subtitle}</div>
      </div>

      <div className="p-6 pt-0 flex flex-col gap-4">{children}</div>
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
