"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema local para validação no client
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInSchema = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onCredentialsSubmit: (data: SignInSchema) => Promise<void>;
  onGoogleSubmit: () => Promise<void>;
  isLoading?: boolean;
}

export function SignInForm({ 
  onCredentialsSubmit, 
  onGoogleSubmit, 
  isLoading = false 
}: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  });

  const handleFormSubmit = async (data: SignInSchema) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onCredentialsSubmit(data);
    } catch (error: any) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred during sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSubmitting || isLoading) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onGoogleSubmit();
    } catch (error: any) {
      console.error("Google sign in error:", error);
      setError("Couldn't continue with Google. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    // TODO: Implementar quando houver Microsoft provider
    setError("Microsoft sign in not yet available.");
  };

  const currentIsLoading = isLoading || isSubmitting;

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2 border-transparent dark:border-border">
      {/* Header */}
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold tracking-tight text-base lg:text-lg">
          Sign in to your account
        </h3>
        <p className="text-sm text-muted-foreground">
          Welcome back! Please sign in to continue.
        </p>
      </div>

      {/* Form Content */}
      <div className="p-6 pt-0 flex flex-col gap-4">
        {/* Error Alert */}
        {error && (
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
              <div className="text-sm">
                {error}
              </div>
            </div>
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Email Field */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium leading-none" htmlFor="email">
              Email
            </label>
            <div className="relative inline-block h-9 w-full">
              <span className="absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail size-4 shrink-0">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-4"
                type="email"
                maxLength={255}
                autoCapitalize="off"
                autoComplete="username"
                id="email"
                disabled={currentIsLoading}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2 flex flex-col">
            <div className="flex flex-row items-center justify-between">
              <label className="text-sm font-medium leading-none" htmlFor="password">
                Password
              </label>
              <a className="ml-auto inline-block text-sm underline" href="/auth/forgot-password">
                Forgot password?
              </a>
            </div>
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
                autoComplete="current-password"
                id="password"
                disabled={currentIsLoading}
                {...register("password")}
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
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full relative"
            type="submit"
            disabled={currentIsLoading}
          >
            {currentIsLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          Or continue with
        </p>

        {/* Social Buttons */}
        <div className="flex flex-row gap-4">
          <button 
            className="justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 flex w-full flex-row items-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={currentIsLoading}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53" />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            Google
          </button>
          <button 
            className="justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 flex w-full flex-row items-center gap-2"
            onClick={handleMicrosoftSignIn}
            disabled={currentIsLoading}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21">
              <path fill="#f25022" d="M1 1h9v9H1z" />
              <path fill="#00a4ef" d="M1 11h9v9H1z" />
              <path fill="#7fba00" d="M11 1h9v9h-9z" />
              <path fill="#ffb900" d="M11 11h9v9h-9z" />
            </svg>
            Microsoft
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="items-center p-6 pt-0 flex justify-center gap-1 text-sm text-muted-foreground">
        <span>Don't have an account?</span>
        <a className="text-foreground underline" href="/auth/sign-up">
          Sign up
        </a>
      </div>
    </div>
  );
}
