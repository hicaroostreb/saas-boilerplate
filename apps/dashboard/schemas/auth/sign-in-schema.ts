import { z } from 'zod';

export const signInSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .trim(),

  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .max(72, 'Password must be less than 72 characters'),
});

export type SignInSchema = z.infer<typeof signInSchema>;
