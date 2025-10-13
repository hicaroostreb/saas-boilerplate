import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AuthCard, AuthLayout } from '@workspace/ui';
import Link from 'next/link';

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  const marketingUrl =
    process.env.NEXT_PUBLIC_MARKETING_URL ?? 'http://localhost:3000';

  if (!token) {
    return (
      <AuthLayout logoHref={marketingUrl} logoText="Acme">
        <AuthCard
          title="Invalid Reset Link"
          description="This password reset link is invalid or has expired."
          footerContent={
            <>
              <span>Need a new reset link?</span>
              <Link
                className="text-foreground underline"
                href="/auth/forgot-password"
              >
                Request reset
              </Link>
            </>
          }
        >
          <div className="text-center">
            <Link
              href="/auth/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Back to sign in
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout logoHref={marketingUrl} logoText="Acme">
      <AuthCard
        title="Reset your password"
        description="Enter your new password below."
        footerContent={
          <>
            <span>Remember your password?</span>
            <Link className="text-foreground underline" href="/auth/sign-in">
              Sign in
            </Link>
          </>
        }
      >
        <ResetPasswordForm token={token} />
      </AuthCard>
    </AuthLayout>
  );
}
