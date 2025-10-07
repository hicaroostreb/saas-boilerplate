import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

interface ResetPasswordPageProps {
  searchParams: {
    token?: string;
  };
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h2>
          <p className="mt-2 text-gray-600">This password reset link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
