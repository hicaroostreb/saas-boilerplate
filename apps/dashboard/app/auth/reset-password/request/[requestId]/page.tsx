// apps/dashboard/app/auth/reset-password/request/[requestId]/page.tsx - ACHROMATIC ENTERPRISE RESET PASSWORD

"use client";

import { ResetPasswordForm, ThemeToggle, toast } from "@workspace/ui";
import { useState, useEffect, use, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { validatePasswordStrength } from "@workspace/auth";

interface ResetPasswordPageProps {
  params: Promise<{ requestId: string }>;
}

interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  email?: string;
  organizationSlug?: string;
  expiresAt?: Date;
  attemptsRemaining?: number;
  error?: string;
}

function ResetPasswordContent({ params }: ResetPasswordPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ ENTERPRISE: Enhanced state management
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValidation, setTokenValidation] = useState<TokenValidationResult | null>(null);
  const [resetComplete, setResetComplete] = useState(false);

  // ✅ ENTERPRISE: Get parameters
  const token = searchParams.get('token') ?? resolvedParams.requestId;
  const email = searchParams.get('email') ?? '';

  // ✅ ENTERPRISE: Validate reset token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValidation({
          isValid: false,
          isExpired: false,
          error: 'Missing reset token'
        });
        setIsValidating(false);
        return;
      }

      try {
        // eslint-disable-next-line no-console
        console.log('🔍 ACHROMATIC: Validating reset token');
        
        const response = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setTokenValidation({
            isValid: true,
            isExpired: false,
            email: result.email,
            organizationSlug: result.organizationSlug,
            expiresAt: new Date(result.expiresAt),
            attemptsRemaining: result.attemptsRemaining,
          });
        } else {
          setTokenValidation({
            isValid: false,
            isExpired: result.error?.code === 'TOKEN_EXPIRED',
            error: result.error?.message ?? 'Invalid reset token',
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ ACHROMATIC: Token validation error:', error);
        setTokenValidation({
          isValid: false,
          isExpired: false,
          error: 'Unable to validate reset token',
        });
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // ✅ ENTERPRISE: Handle password reset with full security validation
  const handleResetPassword = async (data: { 
    requestId: string; 
    password: string; 
    confirmPassword: string; 
  }) => {
    if (isLoading || !tokenValidation?.isValid) return;
    
    setIsLoading(true);
    
    try {
      // eslint-disable-next-line no-console
      console.log('🔍 ACHROMATIC: Starting enterprise password reset');

      // ✅ ENTERPRISE: Client-side password validation
      if (data.password !== data.confirmPassword) {
        toast.error("Passwords do not match");
        setIsLoading(false);
        return;
      }

      // ✅ ENTERPRISE: Password strength validation (CLIENT VERSION - 1 parameter)
      const strengthValidation = validatePasswordStrength(data.password);

      if (!strengthValidation.isValid) {
        toast.error(
          strengthValidation.feedback ?? "Password does not meet security requirements"
        );
        setIsLoading(false);
        return;
      }

      // ✅ ACHROMATIC: Call enterprise reset password API
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Password reset successfully! Redirecting to sign in...");
        setResetComplete(true);
        
        // ✅ ENTERPRISE: Smart redirect with context
        setTimeout(() => {
          const signInUrl = tokenValidation.organizationSlug 
            ? `/auth/sign-in?org=${tokenValidation.organizationSlug}&message=password-reset-success`
            : '/auth/sign-in?message=password-reset-success';
          router.push(signInUrl);
        }, 2000);

      } else {
        // ✅ ENTERPRISE: Handle specific error cases
        if (result.error?.code === 'TOKEN_EXPIRED') {
          toast.error("Reset link has expired. Please request a new one.");
          setTimeout(() => router.push('/auth/forgot-password'), 2000);
        } else if (result.error?.code === 'TOKEN_USED') {
          toast.error("This reset link has already been used.");
          setTimeout(() => router.push('/auth/forgot-password'), 2000);
        } else if (result.error?.code === 'TOKEN_REVOKED') {
          toast.error("This reset link has been revoked.");
          setTimeout(() => router.push('/auth/forgot-password'), 2000);
        } else if (result.error?.code === 'MAX_ATTEMPTS_EXCEEDED') {
          toast.error("Maximum attempts exceeded. Please request a new reset link.");
          setTimeout(() => router.push('/auth/forgot-password'), 2000);
        } else if (result.error?.code === 'PASSWORD_WEAK') {
          toast.error("Password does not meet security requirements");
        } else {
          toast.error(result.error?.message ?? "Failed to reset password. Please try again.");
        }
      }

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ ACHROMATIC: Password reset error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ENTERPRISE: Loading state while validating token
  if (isValidating) {
    return (
      <main className="h-screen dark:bg-background bg-gray-50 px-4">
        <div className="mx-auto w-full min-w-[320px] space-y-6 py-12 max-w-sm">
          <Link className="block w-fit mx-auto" href="/">
            <div className="flex items-center space-x-2">
              <div className="flex size-9 items-center justify-center p-1">
                <div className="flex size-7 items-center justify-center rounded-md border text-primary-foreground bg-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <path d="M7.81815 8.36373L12 0L24 24H15.2809L7.81815 8.36373Z" fill="currentColor"/>
                      <path d="M4.32142 15.3572L8.44635 24H-1.14809e-06L4.32142 15.3572Z" fill="currentColor"/>
                    </g>
                  </svg>
                </div>
              </div>
              <span className="font-bold">Acme</span>
            </div>
          </Link>

          <div className="rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2">
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="font-semibold text-lg mb-2">Validating Reset Link</h3>
              <p className="text-muted-foreground">
                Please wait while we validate your password reset link...
              </p>
            </div>
          </div>
        </div>
        <ThemeToggle className="fixed bottom-2 right-2 rounded-full" />
      </main>
    );
  }

  // ✅ ENTERPRISE: Invalid token state
  if (!tokenValidation?.isValid) {
    return (
      <main className="h-screen dark:bg-background bg-gray-50 px-4">
        <div className="mx-auto w-full min-w-[320px] space-y-6 py-12 max-w-sm">
          <Link className="block w-fit mx-auto" href="/">
            <div className="flex items-center space-x-2">
              <div className="flex size-9 items-center justify-center p-1">
                <div className="flex size-7 items-center justify-center rounded-md border text-primary-foreground bg-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <path d="M7.81815 8.36373L12 0L24 24H15.2809L7.81815 8.36373Z" fill="currentColor"/>
                      <path d="M4.32142 15.3572L8.44635 24H -1.14809e-06L4.32142 15.3572Z" fill="currentColor"/>
                    </g>
                  </svg>
                </div>
              </div>
              <span className="font-bold">Acme</span>
            </div>
          </Link>

          <div className="rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  {tokenValidation?.isExpired ? "Reset Link Expired" : "Invalid Reset Link"}
                </h3>
                <p className="text-muted-foreground">
                  {tokenValidation?.isExpired 
                    ? "This password reset link has expired. Please request a new one."
                    : (tokenValidation?.error ?? "The password reset link is invalid or has been used.")
                  }
                </p>
              </div>

              <div className="space-y-3">
                <Link 
                  href={`/auth/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                >
                  Request New Reset Link
                </Link>

                <div className="text-sm">
                  <Link 
                    href="/auth/sign-in" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ThemeToggle className="fixed bottom-2 right-2 rounded-full" />
      </main>
    );
  }

  // ✅ ENTERPRISE: Success state
  if (resetComplete) {
    return (
      <main className="h-screen dark:bg-background bg-gray-50 px-4">
        <div className="mx-auto w-full min-w-[320px] space-y-6 py-12 max-w-sm">
          <Link className="block w-fit mx-auto" href="/">
            <div className="flex items-center space-x-2">
              <div className="flex size-9 items-center justify-center p-1">
                <div className="flex size-7 items-center justify-center rounded-md border text-primary-foreground bg-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <path d="M7.81815 8.36373L12 0L24 24H15.2809L7.81815 8.36373Z" fill="currentColor"/>
                      <path d="M4.32142 15.3572L8.44635 24H -1.14809e-06L4.32142 15.3572Z" fill="currentColor"/>
                    </g>
                  </svg>
                </div>
              </div>
              <span className="font-bold">Acme</span>
            </div>
          </Link>

          <div className="rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Password Updated Successfully</h3>
                <p className="text-muted-foreground">
                  Your password has been reset. You can now sign in with your new password.
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Redirecting to sign in...
              </p>
            </div>
          </div>
        </div>
        <ThemeToggle className="fixed bottom-2 right-2 rounded-full" />
      </main>
    );
  }

  // ✅ ACHROMATIC: Main reset form
  return (
    <main className="h-screen dark:bg-background bg-gray-50 px-4">
      <div className="mx-auto w-full min-w-[320px] space-y-6 py-12 max-w-sm">
        <Link className="block w-fit mx-auto" href="/">
          <div className="flex items-center space-x-2">
            <div className="flex size-9 items-center justify-center p-1">
              <div className="flex size-7 items-center justify-center rounded-md border text-primary-foreground bg-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <path d="M7.81815 8.36373L12 0L24 24H15.2809L7.81815 8.36373Z" fill="currentColor"/>
                    <path d="M4.32142 15.3572L8.44635 24H -1.14809e-06L4.32142 15.3572Z" fill="currentColor"/>
                  </g>
                </svg>
              </div>
            </div>
            <span className="font-bold">Acme</span>
          </div>
        </Link>

        {/* ✅ ENTERPRISE: Organization context indicator */}
        {tokenValidation.organizationSlug && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Resetting password for <span className="font-medium">{tokenValidation.organizationSlug}</span>
            </p>
          </div>
        )}

        {/* ✅ ENTERPRISE: Email context */}
        {tokenValidation.email && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Account: <span className="font-medium text-foreground">{tokenValidation.email}</span>
            </p>
          </div>
        )}

        {/* ✅ ENTERPRISE: Attempts remaining indicator */}
        {tokenValidation.attemptsRemaining !== undefined && tokenValidation.attemptsRemaining < 3 && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-200 text-center">
              <strong>{tokenValidation.attemptsRemaining}</strong> attempts remaining
            </p>
          </div>
        )}

        {/* ✅ ACHROMATIC: Enhanced reset form */}
        <ResetPasswordForm 
          requestId={token} 
          expires={tokenValidation.expiresAt ?? new Date(Date.now() + 60 * 60 * 1000)}
          onResetPassword={handleResetPassword}
          isLoading={isLoading}
          email={tokenValidation.email}
          showPasswordStrength={true}
          requireStrongPassword={true}
        />

        {/* ✅ ENTERPRISE: Security notice */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
            </svg>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Security Notice</p>
              <p>After resetting your password, all your active sessions will be signed out for security.</p>
            </div>
          </div>
        </div>
      </div>

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
export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  return (
    <Suspense fallback={
      <main className="h-screen dark:bg-background bg-gray-50 px-4">
        <div className="mx-auto w-full min-w-[320px] space-y-6 py-12 max-w-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </main>
    }>
      <ResetPasswordContent params={params} />
    </Suspense>
  );
}
