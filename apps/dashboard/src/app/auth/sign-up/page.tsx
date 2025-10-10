import { SignUpForm } from '@/components/auth/SignUpForm';
import { AuthCard, AuthLayout } from '@workspace/ui';
import Link from 'next/link';

export default function SignUpPage() {
  const marketingUrl =
    process.env.NEXT_PUBLIC_MARKETING_URL ?? 'http://localhost:3000';

  return (
    <AuthLayout logoHref={marketingUrl} logoText="Acme">
      <AuthCard
        title="Create your account"
        description="Join us today! Please fill in your information to get started."
        footerContent={
          <>
            <span>Already have an account?</span>
            <Link className="text-foreground underline" href="/auth/sign-in">
              Sign in
            </Link>
          </>
        }
      >
        <SignUpForm />
      </AuthCard>
    </AuthLayout>
  );
}
