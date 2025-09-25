"use client";

import { ForgotPasswordForm, ThemeToggle, toast } from "@workspace/ui";
import { forgotPassword } from "../../../actions/auth/forgot-password";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { 
    execute, 
    isExecuting,
    result: _result // ✅ Correção: prefixo _ para unused var
  } = useAction(forgotPassword, {
    onError: ({ error }) => {
      toast.error(error.serverError ?? "An error occurred while sending reset instructions"); // ✅ Correção: nullish coalescing
    },
    onSuccess: () => {
      toast.success("Reset instructions sent to your email!");
    }
  });

  const handleForgotPassword = async (data: { email: string }) => {
    execute(data);
  };

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

        <ForgotPasswordForm 
          onForgotPassword={handleForgotPassword}
          isLoading={isExecuting}
        />
      </div>

      <ThemeToggle />
    </main>
  );
}
