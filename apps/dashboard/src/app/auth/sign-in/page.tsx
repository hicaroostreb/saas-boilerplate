import { SignInForm } from '@/components/auth/SignInForm';
import { AuthCard, AuthLayout } from '@workspace/ui';
import Link from 'next/link';

export default function SignInPage() {
  const marketingUrl =
    process.env.NEXT_PUBLIC_MARKETING_URL ?? 'http://localhost:3000';

  return (
    <AuthLayout logoHref={marketingUrl} logoText="Acme">
      <AuthCard
        title="Sign in to your account"
        description="Welcome back! Please sign in to continue."
        footerContent={
          <>
            <span>Don&apos;t have an account?</span>
            <Link className="text-foreground underline" href="/auth/sign-up">
              Sign up
            </Link>
          </>
        }
      >
        <SignInForm />
      </AuthCard>
    </AuthLayout>
  );
}
