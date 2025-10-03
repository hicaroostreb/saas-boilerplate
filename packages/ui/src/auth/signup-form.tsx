// packages/ui/src/auth/sign-up-form.tsx - ENTERPRISE ACHROMATIC ADAPTATION

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PasswordStrength } from '../components/password-strength';

// ✅ ENTERPRISE: Enhanced schema with stronger validation
const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(64, 'Name must be less than 64 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'Name can only contain letters, spaces, hyphens, and apostrophes'
      ),
    email: z
      .string()
      .email('Please enter a valid email')
      .max(255, 'Email must be less than 255 characters')
      .toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be less than 72 characters')
      .refine(
        password => /[A-Z]/.test(password),
        'Password must contain at least one uppercase letter'
      )
      .refine(
        password => /[a-z]/.test(password),
        'Password must contain at least one lowercase letter'
      )
      .refine(
        password => /\d/.test(password),
        'Password must contain at least one number'
      )
      .refine(
        password => /[^A-Za-z0-9]/.test(password),
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    // ✅ ENTERPRISE: Terms acceptance
    acceptTerms: z
      .boolean()
      .refine(val => val === true, 'You must accept the terms and conditions'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

// ✅ ENTERPRISE: Enhanced props interface
interface SignUpFormProps {
  onCredentialsSubmit: (
    data: Omit<SignUpFormData, 'confirmPassword' | 'acceptTerms'>
  ) => Promise<void>;
  onGoogleSubmit?: () => Promise<void>;
  onMicrosoftSubmit?: () => Promise<void>;
  isLoading?: boolean;
  isGoogleLoading?: boolean;
  isMicrosoftLoading?: boolean;

  // ✅ ENTERPRISE: New props for enterprise features
  organizationSlug?: string | null;
  hasInvitation?: boolean;
  showPasswordStrength?: boolean;
  requireStrongPassword?: boolean;
  showMicrosoftAuth?: boolean;
  error?: string | null;

  // ✅ ENTERPRISE: Terms and legal
  termsUrl?: string;
  privacyUrl?: string;

  // ✅ ENTERPRISE: Pre-filled data
  defaultName?: string;
  defaultEmail?: string;
}

export function SignUpForm({
  onCredentialsSubmit,
  onGoogleSubmit,
  onMicrosoftSubmit,
  isLoading = false,
  isGoogleLoading = false,
  isMicrosoftLoading = false,
  organizationSlug,
  hasInvitation = false,
  showPasswordStrength = true,
  requireStrongPassword = true,
  showMicrosoftAuth = false,
  error: externalError,
  termsUrl = '/terms-of-use',
  privacyUrl = '/privacy-policy',
  defaultName = '',
  defaultEmail = '',
}: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ CORRIGIDO: Removidas propriedades inexistentes
  const {
    register,
    handleSubmit,
    formState: { errors }, // ✅ CORRIGIDO: Removido _touchedFields
    watch,
    // setValue, // ✅ CORRIGIDO: Removido _setValue (não utilizado)
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      acceptTerms: false,
    },
  });

  const watchedPassword = watch('password', '');
  const _confirmPassword = watch('confirmPassword', ''); // ✅ CORREÇÃO: Add underscore prefix
  const _acceptTerms = watch('acceptTerms'); // ✅ CORREÇÃO: Add underscore prefix

  // ✅ ENTERPRISE: Combined error handling
  const displayError = externalError ?? internalError; // ✅ CORREÇÃO: || → ||

  const handleFormSubmit = async (data: SignUpFormData) => {
    setIsSubmitting(true);
    setInternalError(null);

    try {
      // ✅ ENTERPRISE: Remove confirm password and terms from submission
      const {
        confirmPassword: _confirmPassword,
        acceptTerms: _acceptTerms,
        ...submitData
      } = data; // ✅ CORREÇÃO: Add underscore prefix to destructured vars
      await onCredentialsSubmit(submitData);
    } catch (_error: unknown) {
      // ✅ CORREÇÃO: any → unknown
      const errorMessage =
        _error instanceof Error
          ? _error.message
          : 'An error occurred during registration. Please try again.';
      setInternalError(errorMessage);
    } finally {
      setIsSubmitting(false); // ✅ CRÍTICO: Não remover este bloco!
    }
  };

  const handleGoogleSignUp = async () => {
    if (isSubmitting || isLoading || isGoogleLoading || !onGoogleSubmit) return;

    setIsSubmitting(true);
    setInternalError(null);

    try {
      await onGoogleSubmit();
    } catch (_error: unknown) {
      // ✅ CORREÇÃO: any → unknown
      setInternalError("Couldn't continue with Google. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMicrosoftSignUp = async () => {
    if (isSubmitting || isLoading || isMicrosoftLoading || !onMicrosoftSubmit)
      return;

    setIsSubmitting(true);
    setInternalError(null);

    try {
      await onMicrosoftSubmit();
    } catch (_error: unknown) {
      // ✅ CORREÇÃO: any → unknown
      setInternalError("Couldn't continue with Microsoft. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentIsLoading = isLoading || isSubmitting;

  // ✅ ENTERPRISE: Build sign in URL with context
  const signInUrl = organizationSlug
    ? `/auth/sign-in?org=${organizationSlug}`
    : '/auth/sign-in';

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2 border-transparent dark:border-border">
      {/* ✅ ENTERPRISE: Enhanced header with context */}
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold tracking-tight text-base lg:text-lg">
          {organizationSlug
            ? `Join ${organizationSlug}`
            : 'Create your account'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasInvitation
            ? `You&apos;ve been invited to join ${organizationSlug}. Please create your account to get started.` // ✅ CORREÇÃO: Escape apostrophe
            : organizationSlug
              ? `Create an account to join ${organizationSlug} and get started.`
              : 'Please fill in the details to get started.'}
        </p>

        {/* ✅ ENTERPRISE: Invitation indicator */}
        {hasInvitation && (
          <div className="flex items-center space-x-2 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
            <svg
              className="w-4 h-4 text-green-600 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-green-600 dark:text-green-400">
              You have a valid invitation
            </span>
          </div>
        )}
      </div>

      {/* Form Content */}
      <div className="p-6 pt-0 flex flex-col gap-4">
        {/* ✅ ENTERPRISE: Enhanced error alert */}
        {displayError && (
          <div
            role="alert"
            className="relative w-full rounded-lg border p-4 text-foreground border-transparent bg-destructive/10"
          >
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
                className="mt-0.5 flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <div className="text-sm flex-1">{displayError}</div>
            </div>
          </div>
        )}

        <form
          className="flex flex-col gap-4"
          onSubmit={void handleSubmit(handleFormSubmit)} // ✅ CORREÇÃO: Add void to handle promise
        >
          {/* Name Field */}
          <div className="space-y-2 flex w-full flex-col">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="name"
            >
              Full Name
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
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-4"
                type="text"
                maxLength={64}
                autoComplete="name"
                id="name"
                placeholder="Enter your full name"
                disabled={currentIsLoading}
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2 flex w-full flex-col">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="email"
            >
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
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-4"
                type="email"
                maxLength={255}
                autoComplete="username"
                id="email"
                placeholder={
                  organizationSlug
                    ? `Enter your ${organizationSlug} email`
                    : 'Enter your email'
                }
                disabled={currentIsLoading}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col">
            <div className="space-y-2 flex flex-col">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="password"
              >
                Password{' '}
                {requireStrongPassword && (
                  <span className="text-xs text-muted-foreground">
                    (Strong password required)
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
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  className="flex h-9 w-full rounded-md border border-input bg-transparent py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 px-10"
                  type={showPassword ? 'text' : 'password'}
                  maxLength={72}
                  autoCapitalize="off"
                  autoComplete="new-password"
                  id="password"
                  placeholder="Create a strong password"
                  disabled={currentIsLoading}
                  {...register('password')}
                />
                <span className="absolute left-auto right-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
                  <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground -mr-2.5 size-8"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    disabled={currentIsLoading}
                  >
                    {showPassword ? (
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
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" x2="22" y1="2" y2="22" />
                      </svg>
                    ) : (
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
                      >
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </span>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}

              {/* ✅ ENTERPRISE: Enhanced Password Strength Component */}
              {showPasswordStrength && (
                <PasswordStrength password={watchedPassword} />
              )}
            </div>
          </div>

          {/* ✅ ENTERPRISE: Confirm Password Field */}
          <div className="space-y-2 flex w-full flex-col">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="confirmPassword"
            >
              Confirm Password
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
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 px-10"
                type={showConfirmPassword ? 'text' : 'password'}
                maxLength={72}
                autoCapitalize="off"
                autoComplete="new-password"
                id="confirmPassword"
                placeholder="Confirm your password"
                disabled={currentIsLoading}
                {...register('confirmPassword')}
              />
              <span className="absolute left-auto right-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground -mr-2.5 size-8"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle password visibility"
                  disabled={currentIsLoading}
                >
                  {showConfirmPassword ? (
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
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
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
                    >
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </span>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}

            {/* ✅ ENTERPRISE: Password match indicator */}
            {watchedPassword && _confirmPassword && (
              <div className="flex items-center space-x-2">
                {watchedPassword === _confirmPassword ? (
                  <>
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      Passwords match
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs text-red-600 dark:text-red-400">
                      Passwords do not match
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ✅ ENTERPRISE: Terms acceptance checkbox */}
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="acceptTerms"
              className="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground mt-0.5"
              disabled={currentIsLoading}
              {...register('acceptTerms')}
            />
            <label
              htmlFor="acceptTerms"
              className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{' '}
              <a
                href={termsUrl}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href={privacyUrl}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
              {organizationSlug && (
                <span className="text-muted-foreground">
                  , and understand that I will be joining{' '}
                  <strong>{organizationSlug}</strong>
                </span>
              )}
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>
          )}

          {/* Submit Button */}
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
            type="submit"
            disabled={currentIsLoading}
          >
            {currentIsLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Divider */}
        <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          Or continue with
        </p>

        {/* ✅ ENTERPRISE: Enhanced social buttons */}
        <div className="flex flex-row gap-4">
          {onGoogleSubmit && (
            <button
              className="justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 flex w-full flex-row items-center gap-2"
              onClick={void handleGoogleSignUp} // ✅ CORREÇÃO: Add void to handle promise
              disabled={currentIsLoading}
            >
              {isGoogleLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53"
                  />
                  <path fill="none" d="M1 1h22v22H1z" />
                </svg>
              )}
              Google
            </button>
          )}

          {showMicrosoftAuth && onMicrosoftSubmit && (
            <button
              className="justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 flex w-full flex-row items-center gap-2"
              onClick={void handleMicrosoftSignUp} // ✅ CORREÇÃO: Add void to handle promise
              disabled={currentIsLoading}
            >
              {isMicrosoftLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 21 21"
                >
                  <path fill="#f25022" d="M1 1h9v9H1z" />
                  <path fill="#00a4ef" d="M1 11h9v9H1z" />
                  <path fill="#7fba00" d="M11 1h9v9h-9z" />
                  <path fill="#ffb900" d="M11 11h9v9h-9z" />
                </svg>
              )}
              Microsoft
            </button>
          )}
        </div>
      </div>

      {/* ✅ ENTERPRISE: Enhanced footer with context */}
      <div className="items-center p-6 pt-0 flex justify-center gap-1 text-sm text-muted-foreground">
        <span>Already have an account?</span>
        <a
          className="text-foreground underline hover:text-primary transition-colors"
          href={signInUrl}
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
