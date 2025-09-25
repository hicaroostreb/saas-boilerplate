"use client";

import { ThemeToggle } from "@workspace/ui";
import Link from "next/link";

export default function ResetPasswordSuccessPage() {
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

        {/* Success Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2 border-transparent dark:border-border">
          {/* Header */}
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold tracking-tight text-base lg:text-lg">
              Password updated
            </h3>
            <p className="text-sm text-muted-foreground">
              Your password has been successfully changed. Use your new password to log in.
            </p>
          </div>

          {/* Footer Link */}
          <div className="items-center p-6 pt-0 flex justify-center text-sm">
            <Link className="text-foreground underline" href="/auth/sign-in">
              Back to log in
            </Link>
          </div>
        </div>
      </div>

      <ThemeToggle />
    </main>
  );
}
