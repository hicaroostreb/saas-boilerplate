'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, FormField } from '@workspace/ui';
import { signUpSchema, type SignUpData } from '@/schemas/auth/sign-up-schema';

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
    } catch (error) {
      setError('Please check your information and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <FormField label="Full name" required>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          required
        />
      </FormField>

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

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}
