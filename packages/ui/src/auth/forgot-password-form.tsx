"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Schema local deve ser idêntico ao schema do dashboard
const forgotPasswordSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .trim(),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onForgotPassword: (data: ForgotPasswordFormData) => Promise<void>; // ✅ CORRETO: usar o type inferido
  isLoading?: boolean;
}

export function ForgotPasswordForm({ onForgotPassword, isLoading = false }: ForgotPasswordFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleFormSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    
    try {
      await onForgotPassword(data);
      setUserEmail(data.email);
      setIsSuccess(true);
    } catch (error: any) {
      setError(error.message || "An error occurred while sending reset instructions. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2 border-transparent dark:border-border">
        {/* Header */}
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold tracking-tight text-base lg:text-lg">
            Reset instructions sent
          </h3>
          <p className="text-sm text-muted-foreground">
            An email with a link and reset instructions is on its way to{" "}
            <strong className="text-foreground font-medium">{userEmail}</strong>.
          </p>
        </div>

        {/* Alert */}
        <div className="p-6 pt-0">
          <div className="relative w-full rounded-lg border p-4 text-foreground border-transparent bg-blue-500/10">
            <div className="flex flex-row items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info mt-0.5 size-[18px] shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <div className="text-sm">
                If you don't receive an email soon, check that the email address you entered is correct, check your spam folder or reach out to support if the issue persists.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="items-center p-6 pt-0 flex justify-center text-sm">
          <a className="text-foreground underline" href="/auth/signin">
            Back to log in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2 border-transparent dark:border-border">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold tracking-tight text-base lg:text-lg">
          Forgot your password?
        </h3>
        <p className="text-sm text-muted-foreground">
          No worries! We'll send you a link with instructions on how to reset your password.
        </p>
      </div>

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

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
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
                maxLength={255}
                autoCapitalize="off"
                autoComplete="username"
                id="email"
                type="email"
                disabled={isLoading}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Sending instructions..." : "Send instructions"}
          </button>
        </form>
      </div>

      <div className="items-center p-6 pt-0 flex justify-center gap-1 text-sm text-muted-foreground">
        <span>Remembered your password?</span>
        <a className="text-foreground underline" href="/auth/signin">
          Sign in
        </a>
      </div>
    </div>
  );
}
