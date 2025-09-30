// apps/dashboard/app/auth/sign-up/page.tsx - ACHROMATIC ENTERPRISE SIGN-UP

'use client';

import { signInAction, validatePasswordStrength } from '@workspace/auth';
import { SignUpForm, ThemeToggle, toast } from '@workspace/ui';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function SignUpContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const searchParams = useSearchParams();

  // ✅ ENTERPRISE: Get URL parameters
  const organizationSlug = searchParams.get('org');
  const returnTo = searchParams.get('returnTo');
  const invitationToken = searchParams.get('invitation');

  // ✅ CORREÇÃO CRÍTICA: Detectar erros de redirect (FIXED)
  const isRedirectError = (error: unknown): boolean => {
    const errorObj = error as {
      message?: string;
      digest?: string;
      name?: string;
      toString?: () => string;
    };
    return (
      errorObj?.message?.includes('NEXT_REDIRECT') ||
      false ||
      errorObj?.digest?.startsWith('NEXT_REDIRECT') ||
      false ||
      errorObj?.name === 'RedirectError' ||
      errorObj?.toString?.()?.includes('NEXT_REDIRECT') ||
      false
    );
  };

  // ✅ ENTERPRISE: Handle credentials sign-up with full enterprise features
  const handleCredentialsSubmit = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      // ✅ ENTERPRISE: Logger replaced console.log

      // ✅ ENTERPRISE: Validate password strength (CLIENT VERSION - 1 parameter)
      const passwordValidation = validatePasswordStrength(data.password);

      if (!passwordValidation.isValid) {
        toast.error(
          passwordValidation.feedback ||
            'Password does not meet security requirements'
        );
        setIsLoading(false);
        return;
      }

      // ✅ ENTERPRISE: Check if user already exists
      const existingUser = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      if (existingUser.ok && existingUser.status < 400) {
        const userData = await existingUser.json();
        if (userData.exists) {
          toast.error('An account with this email already exists');
          setIsLoading(false);
          return;
        }
      }

      // ✅ ENTERPRISE: Create user with enterprise features
      const signUpResult = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email.toLowerCase(),
          password: data.password,
          organizationSlug,
          invitationToken,
          returnTo,
        }),
      });

      const result = await signUpResult.json();

      if (result.success) {
        toast.success('Account created successfully! Signing you in...');

        // ✅ CORREÇÃO CRÍTICA: Auto sign-in com tratamento de redirect
        try {
          const signInResult = await signInAction({
            email: data.email,
            password: data.password,
            organizationSlug: organizationSlug || undefined,
            returnTo: returnTo || undefined,
          });

          // ✅ Se chegou aqui sem erro, verificar resultado
          if (signInResult?.success) {
            toast.success('Welcome! Redirecting to your dashboard...');
          } else if (signInResult?.error) {
            toast.error(signInResult.error.message);
          }
          // ✅ Se signInResult é undefined, provavelmente houve redirect
        } catch (signInError: unknown) {
          console.error(
            '❌ ACHROMATIC: Sign-in after signup error:',
            signInError
          );

          // ✅ CORREÇÃO CRÍTICA: Verificar se é erro de redirect
          if (isRedirectError(signInError)) {
            // ✅ ENTERPRISE: Logger replaced console.log
            // Re-throw para permitir que o Next.js processe o redirect
            throw signInError;
          }

          // Apenas erros reais de sign-in
          toast.success('Account created! Please sign in.');
          window.location.href = `/auth/sign-in${organizationSlug ? `?org=${organizationSlug}` : ''}`;
        }
      } else {
        toast.error(
          result.error?.message || 'Failed to create account. Please try again.'
        );
      }
    } catch (error: unknown) {
      console.error('❌ ACHROMATIC: Sign-up error:', error);

      // ✅ CORREÇÃO CRÍTICA: Verificar se é erro de redirect
      if (isRedirectError(error)) {
        // ✅ ENTERPRISE: Logger replaced console.log
        // Re-throw para permitir que o Next.js processe o redirect
        throw error;
      }

      // Apenas erros reais
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ENTERPRISE: Handle Google OAuth sign-up
  const handleGoogleSubmit = async () => {
    if (isGoogleLoading) {
      return;
    }

    setIsGoogleLoading(true);

    try {
      // ✅ ENTERPRISE: Logger replaced console.log

      // ✅ ACHROMATIC: Build callback URL with organization context
      let callbackUrl = '/dashboard';

      if (organizationSlug) {
        callbackUrl = `/${organizationSlug}/welcome?new=true`;
      } else if (returnTo) {
        callbackUrl = returnTo;
      } else {
        callbackUrl = '/dashboard?new=true';
      }

      await signIn('google', {
        callbackUrl,
        redirect: true,
      });

      toast.success('Redirecting to Google...');
    } catch (error: unknown) {
      console.error('❌ ACHROMATIC: Google sign-up error:', error);

      // ✅ CORREÇÃO: Mesmo tratamento para Google
      if (isRedirectError(error)) {
        // ✅ ENTERPRISE: Logger replaced console.log
        throw error;
      }

      toast.error('Failed to connect to Google. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  // ✅ ENTERPRISE: Handle Microsoft OAuth sign-up (if enabled)
  const handleMicrosoftSubmit = async () => {
    if (isMicrosoftLoading) {
      return;
    }

    setIsMicrosoftLoading(true);

    try {
      // ✅ ENTERPRISE: Logger replaced console.log

      // Check if Microsoft provider is configured
      if (!process.env.NEXT_PUBLIC_MICROSOFT_ENABLED) {
        toast.error('Microsoft sign-up is not available at this time');
        setIsMicrosoftLoading(false);
        return;
      }

      let callbackUrl = '/dashboard';

      if (organizationSlug) {
        callbackUrl = `/${organizationSlug}/welcome?new=true`;
      } else if (returnTo) {
        callbackUrl = returnTo;
      } else {
        callbackUrl = '/dashboard?new=true';
      }

      await signIn('azure-ad', {
        callbackUrl,
        redirect: true,
      });

      toast.success('Redirecting to Microsoft...');
    } catch (error: unknown) {
      console.error('❌ ACHROMATIC: Microsoft sign-up error:', error);

      // ✅ CORREÇÃO: Mesmo tratamento para Microsoft
      if (isRedirectError(error)) {
        // ✅ ENTERPRISE: Logger replaced console.log
        throw error;
      }

      toast.error('Failed to connect to Microsoft. Please try again.');
      setIsMicrosoftLoading(false);
    }
  };

  return (
    <main className="h-screen dark:bg-background bg-gray-50 px-4">
      <div className="mx-auto w-full min-w-[320px] space-y-6 py-12 max-w-sm">
        {/* ✅ ACHROMATIC: Logo with enterprise branding */}
        <Link
          href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
          className="block w-fit mx-auto"
        >
          <div className="flex items-center space-x-2">
            <div className="flex size-9 items-center justify-center p-1">
              <div className="flex size-7 items-center justify-center rounded-md border text-primary-foreground bg-primary">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g>
                    <path
                      d="M7.81815 8.36373L12 0L24 24H15.2809L7.81815 8.36373Z"
                      fill="currentColor"
                    />
                    <path
                      d="M4.32142 15.3572L8.44635 24H-1.14809e-06L4.32142 15.3572Z"
                      fill="currentColor"
                    />
                  </g>
                </svg>
              </div>
            </div>
            <span className="font-bold">Acme</span>
          </div>
        </Link>

        {/* ✅ ENTERPRISE: Context indicators */}
        {organizationSlug && (
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              Join <span className="font-medium">{organizationSlug}</span>
            </p>
            {invitationToken && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ You have an invitation to this organization
              </p>
            )}
          </div>
        )}

        {/* ✅ ACHROMATIC: Enhanced sign-up form with enterprise features */}
        <SignUpForm
          onCredentialsSubmit={handleCredentialsSubmit}
          onGoogleSubmit={handleGoogleSubmit}
          onMicrosoftSubmit={handleMicrosoftSubmit}
          isLoading={isLoading}
          isGoogleLoading={isGoogleLoading}
          isMicrosoftLoading={isMicrosoftLoading}
          // ✅ ENTERPRISE: Pass context to form
          organizationSlug={organizationSlug}
          hasInvitation={Boolean(invitationToken)}
          showPasswordStrength={true}
          requireStrongPassword={true}
        />

        {/* ✅ ENTERPRISE: Enhanced terms and legal links */}
        <div className="px-2 text-xs text-muted-foreground space-y-2">
          <p>
            By signing up, you agree to our{' '}
            <Link
              className="text-foreground underline hover:text-primary transition-colors"
              href="/terms-of-use"
            >
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link
              className="text-foreground underline hover:text-primary transition-colors"
              href="/privacy-policy"
            >
              Privacy Policy
            </Link>
            .
          </p>

          {/* ✅ ENTERPRISE: Additional legal for organization sign-ups */}
          {organizationSlug && (
            <p>
              You will be joining <strong>{organizationSlug}</strong> and agree
              to their organization policies.
            </p>
          )}

          <p>
            Need help?{' '}
            <Link
              className="text-foreground underline hover:text-primary transition-colors"
              href="/contact"
            >
              Get in touch
            </Link>{' '}
            or{' '}
            <Link
              className="text-foreground underline hover:text-primary transition-colors"
              href="/auth/sign-in"
            >
              sign in instead
            </Link>
            .
          </p>
        </div>

        {/* ✅ ENTERPRISE: Security and compliance indicators */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <svg
                className="w-3 h-3 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Encrypted</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg
                className="w-3 h-3 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg
                className="w-3 h-3 text-purple-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Enterprise Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ACHROMATIC: Theme toggle */}
      <ThemeToggle className="fixed bottom-2 right-2 rounded-full" />

      {/* ✅ ENTERPRISE: Version info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-2 left-2 text-xs text-muted-foreground">
          <span>Enterprise Auth v1.0</span>
        </div>
      )}
    </main>
  );
}

// ✅ MAIN COMPONENT COM SUSPENSE
export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <main className="h-screen dark:bg-background bg-gray-50 px-4">
          <div className="mx-auto w-full min-w-[320px] space-y-6 py-12 max-w-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-center text-muted-foreground">
              Loading sign up...
            </p>
          </div>
        </main>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
