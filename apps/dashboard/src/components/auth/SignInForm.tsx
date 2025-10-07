'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, FormField } from '@workspace/ui';
import { signInSchema, type SignInData } from '@/schemas/auth/sign-in-schema';

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = signInSchema.parse({ email, password });
      
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError('Invalid email or password.');
      }
    } catch (error) {
      setError('Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <FormField label="Email address" required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </FormField>

      <FormField label="Password" required>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </FormField>

      {error && (
        <div className="text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          Forgot your password?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
