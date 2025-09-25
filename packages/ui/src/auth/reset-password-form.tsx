"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PasswordStrength } from "../components/password-strength";

// Schema para reset password
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(72)
    .refine((password) => /[A-Z]/.test(password), "Password must contain uppercase letters")
    .refine((password) => /[a-z]/.test(password), "Password must contain lowercase letters")
    .refine((password) => /\d/.test(password), "Password must contain at least one number"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  requestId: string;
  expires: Date;
  onResetPassword: (data: { requestId: string; password: string }) => Promise<void>; // ✅ MANTER ASSIM (não causa erro)
  isLoading?: boolean;
}

// OU ALTERNATIVAMENTE, se quiser ser mais preciso:
// interface ResetPasswordFormProps {
//   requestId: string;
//   expires: Date;
//   onResetPassword: (data: ResetPasswordFormData & { requestId: string }) => Promise<void>;
//   isLoading?: boolean;
// }

export function ResetPasswordForm({ 
  requestId, 
  expires, 
  onResetPassword,
  isLoading = false 
}: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchedPassword = watch("password", "");

  // Calcular tempo de expiração
  const now = new Date();
  const timeLeft = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60)));
  const isExpired = timeLeft <= 0;

  const handleFormSubmit = async (data: ResetPasswordFormData) => {
    setError(null);

    if (isExpired) {
      setError("This reset link has expired. Please request a new password reset.");
      return;
    }

    try {
      await onResetPassword({
        requestId,
        password: data.password
      });
    } catch (error: any) {
      setError(error.message || "An error occurred while resetting your password. Please try again.");
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2 border-transparent dark:border-border">
      {/* Header */}
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold tracking-tight text-base lg:text-lg">
          Reset your password
        </h3>
        <p className="text-sm text-muted-foreground">
          Use the form below to change your password. This request will expire in{" "}
          {isExpired ? (
            <span className="text-destructive font-medium">expired</span>
          ) : (
            `about ${timeLeft} hours`
          )}.
        </p>
      </div>

      {/* Form */}
      <div className="p-6 pt-0">
        {/* Error Alert */}
        {error && (
          <div className="mb-4">
            <div 
              role="alert" 
              className="relative w-full rounded-lg border p-4 text-foreground border-transparent bg-destructive/10"
            >
              <div className="flex flex-row items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-alert size-[18px] shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Token Expired Warning */}
        {isExpired && (
          <div className="mb-4">
            <div 
              role="alert" 
              className="relative w-full rounded-lg border p-4 text-foreground border-transparent bg-yellow-500/10"
            >
              <div className="flex flex-row items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock size-[18px] shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
                <div className="text-sm">
                  <p>This reset link has expired.</p>
                  <p className="mt-1">
                    <a href="/auth/forgot-password" className="text-foreground underline">
                      Request a new password reset
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Password Field */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium leading-none" htmlFor="password">
              Password
            </label>
            <div className="relative inline-block h-9 w-full">
              <span className="absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock size-4 shrink-0">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 px-10"
                type={showPassword ? "text" : "password"}
                maxLength={72}
                autoCapitalize="off"
                id="password"
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off size-4 shrink-0">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye size-4 shrink-0">
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </span>
            </div>

            {/* Password Strength Component */}
            <PasswordStrength password={watchedPassword} />

            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            type="submit"
            disabled={isLoading || isExpired}
          >
            {isLoading ? "Changing password..." : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}
