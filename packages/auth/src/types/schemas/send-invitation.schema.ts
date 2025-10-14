import { z } from 'zod';

export const sendInvitationSchema = z.object({
  organizationId: z
    .string({
      required_error: 'Organization ID is required',
      invalid_type_error: 'Organization ID must be a string',
    })
    .min(1, 'Organization ID is required'),

  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Please enter a valid email address')
    .trim(),

  role: z
    .enum(['owner', 'admin', 'manager', 'member', 'viewer'], {
      required_error: 'Role is required',
      invalid_type_error: 'Role must be one of: owner, admin, manager, member, viewer',
    }),

  message: z
    .string()
    .max(500, 'Message must be less than 500 characters')
    .trim()
    .optional(),
});

export type SendInvitationSchema = z.infer<typeof sendInvitationSchema>;
