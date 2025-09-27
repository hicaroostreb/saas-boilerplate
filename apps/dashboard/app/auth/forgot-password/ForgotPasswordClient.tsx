// apps/dashboard/app/auth/forgot-password/ForgotPasswordClient.tsx

"use client";

import { ForgotPasswordForm, toast } from "@workspace/ui";
import Link from "next/link";
import { isValidEmail } from "@workspace/auth";
import { useState } from "react";

interface ForgotPasswordClientProps {
  defaultEmail: string;
  organizationSlug?: string;
}

export function ForgotPasswordClient({ 
  defaultEmail, 
  organizationSlug 
}: ForgotPasswordClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [lastEmailSent, setLastEmailSent] = useState<string | null>(null);

  // ✅ ENTERPRISE: Handle forgot password with rate limiting and security
  const handleForgotPassword = async (data: { email: string }) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      console.log('🔍 ACHROMATIC: Starting enterprise forgot password flow');
      
      // ✅ ENTERPRISE: Client-side validation
      if (!isValidEmail(data.email)) {
        toast.error("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      // ✅ ENTERPRISE: Check rate limiting on client (UX improvement)
      if (lastEmailSent === data.email) {
        toast.error("Reset email already sent. Please check your inbox or try again in a few minutes.");
        setIsLoading(false);
        return;
      }

      // ✅ ACHROMATIC: Call enterprise forgot password API
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email.toLowerCase().trim(),
          organizationSlug,
          returnUrl: window.location.origin + '/auth/reset-password',
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // ✅ ENTERPRISE: Always show success for security (don't reveal if email exists)
        toast.success("If an account with that email exists, we've sent password reset instructions.");
        setEmailSent(true);
        setLastEmailSent(data.email);
        
        console.log('✅ ACHROMATIC: Password reset email flow completed');
      } else {
        // ✅ ENTERPRISE: Handle specific error cases
        if (result.error?.code === 'RATE_LIMITED') {
          toast.error("Too many reset attempts. Please try again later.");
        } else if (result.error?.code === 'USER_INACTIVE') {
          toast.error("This account is inactive. Please contact support.");
        } else {
          // ✅ SECURITY: Generic message to prevent email enumeration
          toast.success("If an account with that email exists, we've sent password reset instructions.");
          setEmailSent(true);
          setLastEmailSent(data.email);
        }
      }

    } catch (error) {
      console.error('❌ ACHROMATIC: Forgot password error:', error);
      
      // ✅ ENTERPRISE: Fail securely - don't reveal system errors
      toast.success("If an account with that email exists, we've sent password reset instructions.");
      setEmailSent(true);
      setLastEmailSent(data.email);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ENTERPRISE: Handle resend functionality
  const handleResend = async () => {
    if (!lastEmailSent) return;
    
    await handleForgotPassword({ email: lastEmailSent });
  };

  // ✅ ENTERPRISE: Success state with additional actions
  if (emailSent && lastEmailSent) {
    return (
      <div className="space-y-6">
        {/* Success message */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent password reset instructions to <br />
              <span className="font-medium text-foreground">{lastEmailSent}</span>
            </p>
          </div>
        </div>

        {/* Next steps */}
        <div className="space-y-4">
          <div className="p-4 border rounded-lg space-y-3">
            <h3 className="font-medium text-sm">What&apos;s next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check your email inbox and spam folder</li>
              <li>• Click the reset link in the email</li>
              <li>• Create a new secure password</li>
              <li>• The link expires in 1 hour</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="w-full py-2 px-4 text-sm border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Resend email'}
            </button>

            <Link
              href={`/auth/sign-in${organizationSlug ? `?org=${organizationSlug}` : ''}`}
              className="block w-full py-2 px-4 text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ForgotPasswordForm 
      onForgotPassword={handleForgotPassword}
      isLoading={isLoading}
      defaultEmail={defaultEmail}
      organizationSlug={organizationSlug}
      showSecurityNotice={false} // ✅ CORREÇÃO: Desabilitar Security Notice
    />
  );
}
