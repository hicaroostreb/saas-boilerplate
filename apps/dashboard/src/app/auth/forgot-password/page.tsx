import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AuthCard, AuthLayout } from '@workspace/ui';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const marketingUrl =
    process.env.NEXT_PUBLIC_MARKETING_URL ?? 'http://localhost:3000';

  return (
    <AuthLayout logoHref={marketingUrl} logoText="Acme">
      <AuthCard
        title="Forgot your password?"
        description="Enter your email address and we'll send you a link to reset your password."
        footerContent={
          <>
            <span>Remember your password?</span>
            <Link className="text-foreground underline" href="/auth/sign-in">
              Sign in
            </Link>
          </>
        }
      >
        <ForgotPasswordForm />
      </AuthCard>
    </AuthLayout>
  );
}
