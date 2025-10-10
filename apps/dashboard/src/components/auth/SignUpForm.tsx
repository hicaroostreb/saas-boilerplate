'use client';

import { signUpSchema } from '@workspace/auth';
import {
  Button,
  CheckboxField,
  FormField,
  PasswordStrength,
  SocialButton,
} from '@workspace/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Client-side validations
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidName = (name: string) => name.length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client validations
    if (!isValidName(name)) {
      setError('Name must be at least 2 characters long.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setError('Please meet all password requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the terms and privacy policy.');
      return;
    }

    setIsLoading(true);

    try {
      // Only schema validation on client-side
      const data = signUpSchema.parse({ name, email, password });

      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          router.push('/onboarding/organization');
        }, 1500);
      } else {
        // ✅ ESLint fix: usar ?? ao invés de ||
        setError(result.error ?? 'Failed to create account. Please try again.');
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Please check your information and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Icons
  const PersonIcon = () => (
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
      className="lucide lucide-user size-4 shrink-0"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

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

  // ✅ ESLint fix: _show para indicar parâmetro não usado
  const PasswordToggle = ({
    show: _show,
    onToggle,
  }: {
    show: boolean;
    onToggle: () => void;
  }) => (
    <button
      type="button"
      onClick={onToggle}
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
      {/* Name Field */}
      <FormField
        label="Full Name"
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={100}
        autoCapitalize="words"
        autoComplete="name"
        icon={<PersonIcon />}
      />

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
      />

      {/* Password Field with Strength */}
      <div className="space-y-2">
        <FormField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          maxLength={72}
          autoCapitalize="off"
          autoComplete="new-password"
          icon={<LockIcon />}
          rightElement={
            <PasswordToggle
              show={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
            />
          }
        />

        {/* PasswordStrength component */}
        {password.length > 0 && (
          <PasswordStrength
            password={password}
            email={email}
            name={name}
            showRequirements={true}
            variant="detailed"
            minLength={8}
            requireSpecialChars={false}
            onValidationChange={isValid => setIsPasswordValid(isValid)}
          />
        )}
      </div>

      {/* Confirm Password */}
      <FormField
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        maxLength={72}
        autoCapitalize="off"
        autoComplete="new-password"
        icon={<LockIcon />}
        rightElement={
          <PasswordToggle
            show={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        }
        helperText={
          confirmPassword.length > 0 && password !== confirmPassword
            ? 'Passwords do not match'
            : undefined
        }
        error={confirmPassword.length > 0 && password !== confirmPassword}
      />

      {/* Terms Checkbox */}
      <CheckboxField
        checked={acceptTerms}
        onChange={e => setAcceptTerms(e.target.checked)}
        error={
          !acceptTerms &&
          error === 'Please accept the terms and privacy policy.'
        }
        label={
          <>
            I agree to the{' '}
            <a
              href="/terms"
              className="text-foreground underline hover:no-underline"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              className="text-foreground underline hover:no-underline"
            >
              Privacy Policy
            </a>
          </>
        }
      />

      {/* Messages */}
      {error && <div className="text-sm text-destructive">{error}</div>}
      {success && <div className="text-sm text-green-600">{success}</div>}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full relative h-9 px-4 py-2"
        disabled={isLoading}
      >
        {isLoading ? 'Creating account...' : 'Create account'}
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
