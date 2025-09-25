"use client";

import { ResetPasswordForm, ThemeToggle, toast } from "@workspace/ui";
import { resetPassword } from "../../../../../actions/auth/reset-password";
import { useAction } from "next-safe-action/hooks";
import { useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import Link from "next/link";

interface ResetPasswordPageProps {
  params: Promise<{ requestId: string }>;
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const _resolvedParams = use(params); // ✅ Correção: prefixo _ para unused var
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? ''; // ✅ Correção: nullish coalescing
  
  // Estado para expires (será calculado baseado no token se necessário)
  const [expires] = useState(() => {
    // Por agora, 6 horas a partir de agora (pode ser melhorado para buscar do server)
    return new Date(Date.now() + 6 * 60 * 60 * 1000);
  });

  const { 
    execute, 
    isExecuting,
    result: _result // ✅ Correção: prefixo _ para unused var
  } = useAction(resetPassword, {
    onError: ({ error }) => {
      toast.error(error.serverError ?? "An error occurred while resetting password"); // ✅ Correção: nullish coalescing
    },
    onSuccess: () => {
      toast.success("Password reset successfully! Redirecting to sign in...");
      // redirect acontece automaticamente no server action
    }
  });

  const handleResetPassword = async (data: { requestId: string; password: string }) => {
    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    // ✅ Correção: property shorthand
    execute({
      token,
      password: data.password
    });
  };

  // Verificar se tem token na URL
  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token");
    }
  }, [token]);

  if (!token) {
    return (
      <main className="h-screen dark:bg-background bg-gray-50 px-4">
        <div className="mx-auto w-full min-w-[320px] space-y-6 py-12 max-w-sm">
          {/* Logo */}
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
              <h3 className="font-semibold text-lg mb-2">Invalid Reset Link</h3>
              <p className="text-muted-foreground mb-4">
                The password reset link is invalid or missing.
              </p>
              <Link 
                href="/auth/forgot-password" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>

        <ThemeToggle />
      </main>
    );
  }

  return (
    <main className="h-screen dark:bg-background bg-gray-50 px-4">
      <div className="mx-auto w-full min-w-[320px] space-y-6 py-12 max-w-sm">
        {/* Logo */}
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

        <ResetPasswordForm 
          requestId={token} 
          expires={expires}
          onResetPassword={handleResetPassword}
          isLoading={isExecuting}
        />
      </div>

      <ThemeToggle />
    </main>
  );
}
