// packages/ui/src/auth/reset-password-form.tsx - ENTERPRISE ACHROMATIC ADAPTATION

"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PasswordStrength } from "../components/password-strength";

// ✅ ENTERPRISE: Enhanced schema with stronger validation
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters")
    .refine((password) => /[A-Z]/.test(password), "Password must contain at least one uppercase letter")
    .refine((password) => /[a-z]/.test(password), "Password must contain at least one lowercase letter")
    .refine((password) => /\d/.test(password), "Password must contain at least one number")
    .refine((password) => /[^A-Za-z0-9]/.test(password), "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ✅ ENTERPRISE: Enhanced props interface
interface ResetPasswordFormProps {
  requestId: string;
  expires: Date;
  onResetPassword: (data: { requestId: string; password: string; confirmPassword: string }) => Promise<void>;
  isLoading?: boolean;
  
  // ✅ ENTERPRISE: New props for enterprise features
  email?: string;
  organizationSlug?: string | null;
  showPasswordStrength?: boolean;
  requireStrongPassword?: boolean;
  error?: string | null;
  
  // ✅ ENTERPRISE: Success handling
  onSuccess?: () => void;
  
  // ✅ ENTERPRISE: Context URLs
  forgotPasswordUrl?: string;
  signInUrl?: string;
}

export function ResetPasswordForm({ 
  requestId, 
  expires, 
  onResetPassword,
  isLoading = false,
  email,
  organizationSlug,
  showPasswordStrength = true,
  requireStrongPassword = true,
  error: externalError,
  onSuccess,
  forgotPasswordUrl,
  signInUrl,
}: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchedPassword = watch("password", "");
  const watchedConfirmPassword = watch("confirmPassword", "");

  // ✅ ENTERPRISE: Combined error handling
  const displayError = externalError || internalError;

  // ✅ ENTERPRISE: Enhanced time calculation
  const getTimeRemaining = () => {
    const now = new Date();
    const timeLeft = Math.max(0, expires.getTime() - now.getTime());
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, isExpired: timeLeft <= 0, totalMinutes: Math.floor(timeLeft / (1000 * 60)) };
  };

  const { hours, minutes, isExpired, totalMinutes } = getTimeRemaining();

  // ✅ ENTERPRISE: Build URLs with context
  const contextualForgotPasswordUrl = forgotPasswordUrl || (organizationSlug 
    ? `/auth/forgot-password?org=${organizationSlug}${email ? `&email=${encodeURIComponent(email)}` : ''}`
    : `/auth/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`);

  const contextualSignInUrl = signInUrl || (organizationSlug 
    ? `/auth/sign-in?org=${organizationSlug}&message=password-reset`
    : '/auth/sign-in?message=password-reset');

  const handleFormSubmit = async (data: ResetPasswordFormData) => {
    setInternalError(null);

    if (isExpired) {
      setInternalError("This reset link has expired. Please request a new password reset.");
      return;
    }

    try {
      await onResetPassword({
        requestId,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      // ✅ ENTERPRISE: Handle specific error types
      if (error.message?.includes('expired')) {
        setInternalError("This reset link has expired. Please request a new password reset.");
      } else if (error.message?.includes('used')) {
        setInternalError("This reset link has already been used. Please request a new password reset.");
      } else if (error.message?.includes('weak')) {
        setInternalError("Password does not meet security requirements. Please choose a stronger password.");
      } else {
        setInternalError(error.message || "An error occurred while resetting your password. Please try again.");
      }
    }
  };

  // ✅ ENTERPRISE: Success state
  if (isSuccess) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2 border-transparent dark:border-border">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-semibold tracking-tight text-base lg:text-lg">
              Password reset successful
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Your password has been successfully reset. You can now sign in with your new password.
            {email && (
              <span className="block mt-1">
                Account: <span className="font-medium">{email}</span>
              </span>
            )}
          </p>
        </div>

        <div className="p-6 pt-0 space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                <p className="font-medium">Security Notice</p>
                <p>For your security, all your other active sessions have been signed out. You'll need to sign in again on other devices.</p>
              </div>
            </div>
          </div>

          <a 
            href={contextualSignInUrl}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
          >
            Continue to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2 border-transparent dark:border-border">
      {/* ✅ ENTERPRISE: Enhanced header with context */}
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold tracking-tight text-base lg:text-lg">
          {organizationSlug 
            ? `Reset your ${organizationSlug} password`
            : 'Reset your password'
          }
        </h3>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {email 
              ? `Creating a new password for ${email}`
              : 'Create a new secure password below'
            }
            {organizationSlug && (
              <span className="block text-xs mt-1">Organization: {organizationSlug}</span>
            )}
          </p>
          
          {/* ✅ ENTERPRISE: Enhanced expiration display */}
          <div className="flex items-center space-x-2">
            {isExpired ? (
              <div className="flex items-center space-x-1 text-xs text-red-600 dark:text-red-400">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">This link has expired</span>
              </div>
            ) : totalMinutes < 60 ? (
              <div className="flex items-center space-x-1 text-xs text-orange-600 dark:text-orange-400">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Expires in {totalMinutes} minutes</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>
                  Expires in {hours > 0 && `${hours}h `}{minutes}m
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 pt-0">
        {/* ✅ ENTERPRISE: Enhanced error alerts */}
        {displayError && (
          <div className="mb-4">
            <div 
              role="alert" 
              className="relative w-full rounded-lg border p-4 text-foreground border-transparent bg-destructive/10"
            >
              <div className="flex flex-row items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <div className="text-sm flex-1">{displayError}</div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ ENTERPRISE: Enhanced token expired warning */}
        {isExpired && (
          <div className="mb-4">
            <div 
              role="alert" 
              className="relative w-full rounded-lg border p-4 text-foreground border-transparent bg-yellow-500/10"
            >
              <div className="flex flex-row items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
                <div className="text-sm space-y-2">
                  <p><strong>This reset link has expired.</strong></p>
                  <p>Password reset links are only valid for 1 hour for security reasons.</p>
                  <a 
                    href={contextualForgotPasswordUrl} 
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    Request a new password reset →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
          {/* New Password Field */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium leading-none" htmlFor="password">
              New Password {requireStrongPassword && <span className="text-xs text-muted-foreground">(Strong password required)</span>}
            </label>
            <div className="relative inline-block h-9 w-full">
              <span className="absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 px-10"
                type={showPassword ? "text" : "password"}
                maxLength={72}
                autoCapitalize="off"
                autoComplete="new-password"
                id="password"
                placeholder="Create a strong password"
                disabled={isExpired || isLoading}
                {...register("password")}
              />
              <span className="absolute left-auto right-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground -mr-2.5 size-8"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  disabled={isExpired || isLoading}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </span>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}

            {/* ✅ ENTERPRISE: Enhanced Password Strength Component */}
            {showPasswordStrength && !isExpired && (
              <PasswordStrength password={watchedPassword} />
            )}
          </div>

          {/* ✅ ENTERPRISE: Confirm Password Field */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium leading-none" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <div className="relative inline-block h-9 w-full">
              <span className="absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 px-10"
                type={showConfirmPassword ? "text" : "password"}
                maxLength={72}
                autoCapitalize="off"
                autoComplete="new-password"
                id="confirmPassword"
                placeholder="Confirm your new password"
                disabled={isExpired || isLoading}
                {...register("confirmPassword")}
              />
              <span className="absolute left-auto right-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground -mr-2.5 size-8"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle password visibility"
                  disabled={isExpired || isLoading}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </span>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
            
            {/* ✅ ENTERPRISE: Password match indicator */}
            {watchedPassword && watchedConfirmPassword && !isExpired && (
              <div className="flex items-center space-x-2">
                {watchedPassword === watchedConfirmPassword ? (
                  <>
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-green-600 dark:text-green-400">Passwords match</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-red-600 dark:text-red-400">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            type="submit"
            disabled={isLoading || isExpired}
          >
            {isLoading ? "Resetting password..." : "Reset password"}
          </button>
        </form>

        {/* ✅ ENTERPRISE: Security notice */}
        {!isExpired && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Security Information</p>
                <p>After resetting your password, all your active sessions will be signed out for security. You'll need to sign in again on all devices.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ ENTERPRISE: Enhanced footer */}
      <div className="items-center p-6 pt-0 flex flex-col space-y-2 text-sm text-muted-foreground">
        {!isExpired ? (
          <div className="flex items-center space-x-4 text-xs">
            <a href={contextualSignInUrl} className="hover:text-foreground transition-colors">
              Back to sign in
            </a>
            <span>•</span>
            <a href="/support" className="hover:text-foreground transition-colors">
              Need help?
            </a>
          </div>
        ) : (
          <div className="text-center">
            <a 
              href={contextualForgotPasswordUrl}
              className="text-primary hover:underline font-medium"
            >
              Request new password reset
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
