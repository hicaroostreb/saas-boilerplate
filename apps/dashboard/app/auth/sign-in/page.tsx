"use client";

import { SignInForm, ThemeToggle, toast } from "@workspace/ui";
import { signInWithCredentials } from "../../../actions/auth/sign-in-with-credentials";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";

export default function SignInPage() {
  const { 
    execute, 
    isExecuting, 
    result: _result // ✅ Correção: prefixo _ para unused var
  } = useAction(signInWithCredentials, {
    onError: ({ error }) => {
      toast.error(error.serverError ?? "An error occurred during sign in"); // ✅ Correção: nullish coalescing
    },
    onSuccess: () => {
      toast.success("Welcome back!");
      // redirect acontece automaticamente no server action
    }
  });

  // Handler para credentials
  const handleCredentialsSubmit = async (data: { email: string; password: string }) => {
    execute(data);
  };

  // Handler vazio para Google (por enquanto)
  const handleGoogleSubmit = async () => {
    toast.error("Google sign in not implemented yet");
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-xs font-bold">A</span>
          </div>
          SaaS Boilerplate
        </Link>

        <SignInForm 
          onCredentialsSubmit={handleCredentialsSubmit}
          onGoogleSubmit={handleGoogleSubmit}
          isLoading={isExecuting}
        />
      </div>

      <ThemeToggle />
    </div>
  );
}
