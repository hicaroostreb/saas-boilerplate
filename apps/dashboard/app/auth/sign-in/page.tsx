// apps/dashboard/app/auth/sign-in/page.tsx - ACHROMATIC ENTERPRISE SIGN-IN

"use client";

import { SignInForm, ThemeToggle, toast } from "@workspace/ui";
import { signInAction } from '@workspace/auth';
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const searchParams = useSearchParams();
  
  // ✅ ENTERPRISE: Get URL parameters
  const organizationSlug = searchParams.get('org');
  const returnTo = searchParams.get('returnTo');
  const error = searchParams.get('error');

  // ✅ CORREÇÃO CRÍTICA: Detectar erros de redirect
  const isRedirectError = (error: any): boolean => {
    return (
      error?.message?.includes('NEXT_REDIRECT') ||
      error?.digest?.startsWith('NEXT_REDIRECT') ||
      error?.name === 'RedirectError' ||
      error?.toString?.()?.includes('NEXT_REDIRECT')
    );
  };

  // ✅ ENTERPRISE: Handle credentials sign-in with full enterprise features
  const handleCredentialsSubmit = async (data: { email: string; password: string }) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      console.log('🔍 ACHROMATIC: Starting enterprise credentials sign-in');
      
      const result = await signInAction({
        email: data.email,
        password: data.password,
        organizationSlug: organizationSlug ?? undefined,
        returnTo: returnTo ?? undefined,
      });

      // ✅ CORREÇÃO CRÍTICA: Se chegou aqui, verificar se existe resultado
      if (result) {
        if (result.success) {
          toast.success("Welcome back! Redirecting...");
          // ✅ ACHROMATIC: Redirect happens inside signInAction
        } else {
          // ✅ ENTERPRISE: Handle different error types
          if (result.requiresMFA) {
            toast.error("Two-factor authentication required");
            // TODO: Redirect to MFA page
          } else if (result.error) {
            toast.error(result.error.message);
          } else {
            toast.error("Sign in failed. Please try again.");
          }
        }
      }
      // ✅ CORREÇÃO CRÍTICA: Se result é undefined, provavelmente houve redirect
      // Não fazer nada - o redirect já aconteceu
      
    } catch (error: any) {
      console.error('❌ ACHROMATIC: Sign-in error:', error);
      
      // ✅ CORREÇÃO CRÍTICA: Verificar se é erro de redirect
      if (isRedirectError(error)) {
        console.log('🔄 Redirect detected in page, allowing Next.js to handle...');
        // Re-throw para permitir que o Next.js processe o redirect
        throw error;
      }
      
      // Apenas erros reais
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ENTERPRISE: Handle Google OAuth sign-in
  const handleGoogleSubmit = async () => {
    if (isGoogleLoading) return;
    
    setIsGoogleLoading(true);
    
    try {
      console.log('🔍 ACHROMATIC: Starting Google OAuth sign-in');
      
      // ✅ ACHROMATIC: Build callback URL with organization context
      let callbackUrl = '/dashboard';
      
      if (organizationSlug) {
        callbackUrl = `/${organizationSlug}`;
      } else if (returnTo) {
        callbackUrl = returnTo;
      }

      await signIn('google', { 
        callbackUrl,
        redirect: true, // Let NextAuth handle redirect
      });
      
      toast.success("Redirecting to Google...");
    } catch (error: any) {
      console.error('❌ ACHROMATIC: Google sign-in error:', error);
      
      // ✅ CORREÇÃO: Mesmo tratamento para Google
      if (isRedirectError(error)) {
        console.log('🔄 Google redirect detected, allowing Next.js to handle...');
        throw error;
      }
      
      toast.error("Failed to connect to Google. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  // ✅ ENTERPRISE: Display error messages from URL
  if (error) {
    let errorMessage = "An error occurred during sign in";
    
    switch (error) {
      case 'CredentialsSignin':
        errorMessage = "Invalid email or password";
        break;
      case 'AccessDenied':
        errorMessage = "Access denied. Please contact your administrator.";
        break;
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
        errorMessage = "Error connecting with OAuth provider";
        break;
      case 'SessionRequired':
        errorMessage = "Please sign in to continue";
        break;
      default:
        errorMessage = `Authentication error: ${error}`;
    }
    
    // Show error toast on component mount
    setTimeout(() => toast.error(errorMessage), 100);
  }

  return (
    <main className="h-screen dark:bg-background bg-gray-50 px-4">
      <div className="mx-auto w-full min-w-[320px] space-y-6 py-12 max-w-sm">
        {/* ✅ ACHROMATIC: Logo with enterprise branding */}
        <Link href={process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"} className="block w-fit mx-auto">
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

        {/* ✅ ENTERPRISE: Organization context indicator */}
        {organizationSlug && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Signing in to <span className="font-medium">{organizationSlug}</span>
            </p>
          </div>
        )}

        {/* ✅ ACHROMATIC: Enhanced sign-in form with enterprise features */}
        <SignInForm 
          onCredentialsSubmit={handleCredentialsSubmit}
          onGoogleSubmit={handleGoogleSubmit}
          isLoading={isLoading}
          isGoogleLoading={isGoogleLoading}
          // ✅ ENTERPRISE: Pass context to form
          organizationSlug={organizationSlug}
          showRememberMe={true}
          showForgotPassword={true}
        />

        {/* ✅ ENTERPRISE: Additional enterprise features */}
        <div className="space-y-4">
          {/* Sign up link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link 
              href={`/auth/sign-up${organizationSlug ? `?org=${organizationSlug}` : ''}${returnTo ? `${organizationSlug ? '&' : '?'}returnTo=${encodeURIComponent(returnTo)}` : ''}`}
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign up
            </Link>
          </div>

          {/* ✅ ENTERPRISE: Security notice */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Protected by enterprise-grade security</p>
          </div>

          {/* ✅ ENTERPRISE: Help & support */}
          <div className="text-center text-xs">
            <Link 
              href="/support" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Need help? Contact support
            </Link>
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
export default function SignInPage() {
  return (
    <Suspense fallback={
      <main className="h-screen dark:bg-background bg-gray-50 px-4">
        <div className="mx-auto w-full min-w-[320px] space-y-6 py-12 max-w-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-center text-muted-foreground">Loading sign in...</p>
        </div>
      </main>
    }>
      <SignInContent />
    </Suspense>
  );
}
