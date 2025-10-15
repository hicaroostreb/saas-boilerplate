import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z
    .string({
      required_error: 'Organization name is required',
      invalid_type_error: 'Organization name must be a string',
    })
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters')
    .trim(),

  slug: z
    .string({
      required_error: 'Organization slug is required',
      invalid_type_error: 'Organization slug must be a string',
    })
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(
      /^[a-z0-9]([a-z0-9-]{0,48}[a-z0-9])?$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    )
    .trim(),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),
});

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;
