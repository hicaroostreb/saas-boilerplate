'use client';

import { forgotPasswordSchema } from '@workspace/auth';
import { Button, FormField } from '@workspace/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = forgotPasswordSchema.parse({ email });

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage('Password reset email sent! Check your inbox.');
      } else {
        setMessage('Failed to send reset email. Please try again.');
      }
    } catch {
      setMessage('Please enter a valid email address.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <FormField
        label="Email address"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />

      {message && (
        <div className="text-sm text-center text-gray-600">{message}</div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Reset Email'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => router.push('/auth/sign-in')}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          Back to sign in
        </button>
      </div>
    </form>
  );
}
