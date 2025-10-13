import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    token: z
      .string({
        required_error: 'Reset token is required',
        invalid_type_error: 'Token must be a string',
      })
      .min(1, 'Reset token is required'),

    password: z
      .string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be a string',
      })
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be less than 72 characters'),

    confirmPassword: z
      .string({
        required_error: 'Please confirm your password',
        invalid_type_error: 'Confirm password must be a string',
      })
      .min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
