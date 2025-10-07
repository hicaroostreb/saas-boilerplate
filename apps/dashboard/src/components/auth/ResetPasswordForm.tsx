'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, FormField } from '@workspace/ui';
import { resetPasswordSchema } from '@/schemas/auth/reset-password-schema';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = resetPasswordSchema.parse({ token, password, confirmPassword });
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage('Password reset successful! Redirecting to sign in...');
        setTimeout(() => router.push('/auth/sign-in'), 2000);
      } else {
        setMessage('Failed to reset password. Please try again.');
      }
    } catch {
      setMessage('Please check your password requirements.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <FormField label="New Password" required>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          required
        />
      </FormField>

      <FormField label="Confirm Password" required>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
        />
      </FormField>

      {message && (
        <div className="text-sm text-center text-gray-600">
          {message}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );
}
