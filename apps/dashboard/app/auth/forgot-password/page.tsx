// apps/dashboard/app/auth/forgot-password/page.tsx - ACHROMATIC ENTERPRISE FORGOT PASSWORD

import { ThemeToggle } from "@workspace/ui";
import Link from "next/link";
import { ForgotPasswordClient } from "./ForgotPasswordClient";

interface ForgotPasswordPageProps {
  searchParams: Promise<{
    email?: string;
    org?: string;
  }>;
}

export default async function ForgotPasswordPage({ 
  searchParams 
}: ForgotPasswordPageProps) {
  // ✅ NEXT.JS 15: Await searchParams
  const resolvedSearchParams = await searchParams;
  
  // ✅ ENTERPRISE: Get URL parameters from resolved params
  const email = resolvedSearchParams.email ?? '';
  const organizationSlug = resolvedSearchParams.org;

  return (
    <main className="h-screen dark:bg-background bg-gray-50 px-4">
      <div className="mx-auto w-full min-w-[320px] space-y-6 py-12 max-w-sm">
        {/* ✅ ACHROMATIC: Logo limpo */}
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

        {/* ✅ CORREÇÃO: Deixar o ForgotPasswordClient renderizar seu próprio card */}
        <ForgotPasswordClient 
          defaultEmail={email}
          organizationSlug={organizationSlug}
        />
      </div>

      {/* ✅ ACHROMATIC: Theme toggle */}
      <ThemeToggle className="fixed bottom-2 right-2 rounded-full" />
    </main>
  );
}
