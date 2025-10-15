'use client';

import { signInSchema } from '@workspace/auth/client';
import { Button, FormField, SocialButton } from '@workspace/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = signInSchema.parse({ email, password });

      // ✅ FIX: Usar NextAuth signIn ao invés de fetch direto
      const { signIn } = await import('next-auth/react');

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false, // Handle redirect manually
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else if (result?.ok) {
        router.push('/dashboard');
        router.refresh(); // Force refresh to update session
      } else {
        setError('Sign in failed. Please try again.');
      }
    } catch {
      setError('Please enter valid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Ícones exatos do template
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

  const PasswordToggle = () => (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground -mr-2.5 size-8"
      aria-label="Toggle password visibility"
    >
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
        className="lucide lucide-eye size-4 shrink-0"
      >
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {/* Email Field */}
      <FormField
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        maxLength={255}
        autoCapitalize="off"
        autoComplete="username"
        icon={<EmailIcon />}
        error={!!error}
      />

      {/* Password Field */}
      <FormField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={e => setPassword(e.target.value)}
        maxLength={72}
        autoCapitalize="off"
        autoComplete="current-password"
        icon={<LockIcon />}
        rightElement={<PasswordToggle />}
        forgotPasswordLink="/auth/forgot-password"
        error={!!error}
      />

      {error && <div className="text-sm text-destructive">{error}</div>}

      {/* Sign in Button */}
      <Button
        type="submit"
        className="w-full relative h-9 px-4 py-2"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>

      {/* Divider */}
      <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        Or continue with
      </p>

      {/* Social Buttons */}
      <div className="flex flex-row gap-4">
        <SocialButton
          provider="google"
          className="justify-center h-9 px-4 py-2 flex w-full flex-row items-center gap-2"
        >
          Google
        </SocialButton>
        <SocialButton
          provider="microsoft"
          className="justify-center h-9 px-4 py-2 flex w-full flex-row items-center gap-2"
        >
          Microsoft
        </SocialButton>
      </div>
    </form>
  );
}
