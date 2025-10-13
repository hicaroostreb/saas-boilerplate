'use client';

import { resetPasswordSchema } from '@workspace/auth';
import { Button, FormField, PasswordStrength } from '@workspace/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // ✅ SAME validation as SignUp
      if (!isPasswordValid) {
        setMessage('Please meet all password requirements.');
        setIsLoading(false);
        return;
      }

      const data = resetPasswordSchema.parse({
        token,
        password,
        confirmPassword,
      });

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message ?? 'Password reset successfully!');
        setIsSuccess(true);

        setTimeout(() => {
          router.push('/auth/sign-in?message=password-reset');
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(
          errorData.message ?? 'Failed to reset password. Please try again.'
        );
        setIsSuccess(false);
      }
    } catch {
      setMessage('Please check your password requirements.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const LockIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-lock size-4 shrink-0"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {/* Password Field with Strength */}
      <div className="space-y-2">
        <FormField
          label="New Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          maxLength={72}
          autoCapitalize="off"
          autoComplete="new-password"
          icon={<LockIcon />}
          error={!!message && !isSuccess}
          placeholder="Enter your new password"
        />

        {/* ✅ SAME PasswordStrength as SignUp */}
        {password.length > 0 && (
          <PasswordStrength
            password={password}
            showRequirements={true}
            variant="detailed"
            minLength={8}
            requireSpecialChars={false}
            onValidationChange={isValid => setIsPasswordValid(isValid)}
          />
        )}
      </div>

      <FormField
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        maxLength={72}
        autoCapitalize="off"
        autoComplete="new-password"
        icon={<LockIcon />}
        error={!!message && !isSuccess}
        placeholder="Confirm your new password"
      />

      {message && (
        <div
          className={`text-sm ${isSuccess ? 'text-green-600' : 'text-destructive'}`}
        >
          {message}
        </div>
      )}

      <Button
        type="submit"
        className="w-full relative h-9 px-4 py-2"
        disabled={isLoading || isSuccess || !token}
      >
        {isLoading ? 'Resetting...' : isSuccess ? 'Success!' : 'Reset Password'}
      </Button>
    </form>
  );
}
