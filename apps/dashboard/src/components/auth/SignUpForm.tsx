'use client';

import { signUpSchema } from '@workspace/auth';
import { Button, FormField } from '@workspace/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = signUpSchema.parse({ name, email, password });

      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/auth/sign-in?message=Account created successfully');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch {
      setError('Please check your information and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <FormField
        label="Full name"
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter your full name"
        required
      />

      <FormField
        label="Email address"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />

      <FormField
        label="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
      />

      {error && <div className="text-sm text-red-600 text-center">{error}</div>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>

      <div className="text-center">
        <Link
          href="/auth/sign-in"
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </form>
  );
}
