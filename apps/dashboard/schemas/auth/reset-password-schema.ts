import { z } from 'zod';

export const resetPasswordSchema = z.object({
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
    .max(72, 'Password must be less than 72 characters')
    .refine(password => /[A-Z]/.test(password), {
      message: 'Password must contain at least one uppercase letter',
    })
    .refine(password => /[a-z]/.test(password), {
      message: 'Password must contain at least one lowercase letter',
    })
    .refine(password => /\d/.test(password), {
      message: 'Password must contain at least one number',
    }),
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
