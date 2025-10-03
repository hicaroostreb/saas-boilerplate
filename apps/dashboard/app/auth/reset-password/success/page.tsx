// apps/dashboard/app/auth/reset-password/success/page.tsx - ACHROMATIC ENTERPRISE SUCCESS

import { ThemeToggle } from '@workspace/ui';
import Link from 'next/link';

interface ResetPasswordSuccessPageProps {
  searchParams: Promise<{
    org?: string;
    email?: string;
    redirect?: string;
  }>;
}

export default async function ResetPasswordSuccessPage({
  searchParams,
}: ResetPasswordSuccessPageProps) {
  // ✅ NEXT.JS 15: Await searchParams
  const resolvedSearchParams = await searchParams;

  // ✅ ENTERPRISE: Get context parameters from resolved params
  const organizationSlug = resolvedSearchParams.org;
  const email = resolvedSearchParams.email;
  const autoRedirect = resolvedSearchParams.redirect !== 'false';

  return (
    <>
      <main className="h-screen dark:bg-background bg-gray-50 px-4">
        <div className="mx-auto w-full min-w-[320px] space-y-6 py-12 max-w-sm">
          {/* ✅ ACHROMATIC: Logo with enterprise branding */}
          <Link className="block w-fit mx-auto" href="/">
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
                        d="M4.32142 15.3572L8.44635 24H -1.14809e-06L4.32142 15.3572Z"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                </div>
              </div>
              <span className="font-bold">Acme</span>
            </div>
          </Link>

          {/* ✅ ENTERPRISE: Enhanced success card */}
          <div className="rounded-xl border bg-card text-card-foreground shadow w-full px-4 py-2 border-transparent dark:border-border">
            <div className="flex flex-col space-y-1.5 p-6">
              {/* Success icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Title and description */}
              <div className="text-center space-y-2">
                <h3 className="font-semibold tracking-tight text-base lg:text-lg">
                  Password Updated Successfully
                </h3>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Your password has been successfully reset.
                  </p>

                  {email && (
                    <p className="text-sm text-muted-foreground">
                      You can now sign in to{' '}
                      <span className="font-medium text-foreground">
                        {email}
                      </span>
                    </p>
                  )}

                  {organizationSlug && (
                    <p className="text-sm text-muted-foreground">
                      Organization:{' '}
                      <span className="font-medium text-foreground">
                        {organizationSlug}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* ✅ ENTERPRISE: Security information */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg
                    className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">Security Notice</p>
                    <p>
                      For your security, all your other active sessions have
                      been signed out. You&apos;ll need to sign in again on
                      other devices.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ ENTERPRISE: Action buttons with auto-redirect info */}
            <div className="items-center p-6 pt-0 flex flex-col space-y-3 text-sm">
              <Link
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
                href={
                  organizationSlug
                    ? `/auth/sign-in?org=${organizationSlug}`
                    : '/auth/sign-in'
                }
              >
                Sign In Now
              </Link>

              {autoRedirect && (
                <p className="text-xs text-muted-foreground text-center">
                  You will be automatically redirected to sign in in 5 seconds
                </p>
              )}

              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <Link
                  href="/support"
                  className="hover:text-foreground transition-colors"
                >
                  Need help?
                </Link>
                <Link
                  href="/auth/forgot-password"
                  className="hover:text-foreground transition-colors"
                >
                  Forgot password again?
                </Link>
              </div>
            </div>
          </div>

          {/* ✅ ENTERPRISE: Additional security tips */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <svg
                  className="w-3 h-3 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Secure Reset</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg
                  className="w-3 h-3 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>All Sessions Cleared</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg
                  className="w-3 h-3 text-purple-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Enterprise Security</span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ ACHROMATIC: Theme toggle */}
        <ThemeToggle className="fixed bottom-2 right-2 rounded-full" />

        {/* ✅ ENTERPRISE: Version info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-2 left-2 text-xs text-muted-foreground">
            <span>Enterprise Auth v1.0</span>
          </div>
        )}
      </main>

      {/* ✅ ENTERPRISE: Client-side auto-redirect script */}
      {autoRedirect && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              setTimeout(() => {
                const signInUrl = ${
                  organizationSlug
                    ? `'/auth/sign-in?org=${organizationSlug}&message=password-reset-complete'`
                    : "'/auth/sign-in?message=password-reset-complete'"
                };
                window.location.href = signInUrl;
              }, 5000);
            `,
          }}
        />
      )}
    </>
  );
}
