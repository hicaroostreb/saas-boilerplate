'use client';

import { forgotPasswordSchema } from '@workspace/auth/client';
import { Button, FormField } from '@workspace/ui';
import Link from 'next/link';
import { useState } from 'react';

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const data = forgotPasswordSchema.parse({ email });

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage('Password reset email sent! Check your inbox.');
        setIsSuccess(true);
      } else {
        const errorData = await response.json();
        setMessage(
          errorData.message ?? 'Failed to send reset email. Please try again.'
        );
        setIsSuccess(false);
      }
    } catch {
      setMessage('Please enter a valid email address.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ MESMO ÍCONE DO SignInForm
  const EmailIcon = () => (
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
      className="lucide lucide-mail size-4 shrink-0"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {/* ✅ MESMO PADRÃO DO SignInForm */}
      <FormField
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        maxLength={255}
        autoCapitalize="off"
        autoComplete="username"
        icon={<EmailIcon />}
        error={!!message && !isSuccess}
        placeholder="Enter your email address"
      />

      {message && (
        <div
          className={`text-sm ${isSuccess ? 'text-green-600' : 'text-destructive'}`}
        >
          {message}
        </div>
      )}

      {/* ✅ MESMO ESTILO DO SignInForm */}
      <Button
        type="submit"
        className="w-full relative h-9 px-4 py-2"
        disabled={isLoading || isSuccess}
      >
        {isLoading
          ? 'Sending...'
          : isSuccess
            ? 'Email Sent!'
            : 'Send Reset Email'}
      </Button>

      {/* ✅ MESMO PADRÃO DE LINK DO SignInForm */}
      <div className="text-center">
        <Link
          href="/auth/sign-in"
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
