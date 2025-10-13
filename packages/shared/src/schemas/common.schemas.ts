/**
 * @fileoverview Schemas Zod compartilhados
 * Validações reutilizáveis consolidadas de todos os domínios
 */

import { z } from 'zod';

// Schemas básicos reutilizáveis
export const IdSchema = z.string().min(1);
export const SlugSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9-]+$/);
export const EmailSchema = z.string().email().max(255).toLowerCase();
export const UrlSchema = z.string().url();

// Schemas de paginação
export const PaginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// Schema de entidade base
export const BaseEntitySchema = z.object({
  id: IdSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schemas de usuário
export const PasswordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(100, 'Senha muito longa')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Senha deve conter pelo menos uma letra minúscula, maiúscula e um número'
  );

export const NameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo')
  .trim();

export const UserRoleSchema = z.enum(['owner', 'admin', 'member']);
export const UserStatusSchema = z.enum([
  'active',
  'inactive',
  'pending',
  'suspended',
]);

// Schemas de autenticação
export const SignInSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const SignUpSchema = z
  .object({
    name: NameSchema,
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

// Schemas de preferências
export const ThemeSchema = z.enum(['light', 'dark', 'system']);
export const LanguageSchema = z.enum(['pt-BR', 'en-US', 'es-ES']);
export const TimezoneSchema = z.string().min(1, 'Timezone é obrigatório');

export const PreferencesSchema = z.object({
  theme: ThemeSchema.optional(),
  language: LanguageSchema.optional(),
  timezone: TimezoneSchema.optional(),
  dateFormat: z.enum(['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd']).optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
  emailNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

// Schemas de billing
export const PlanIdSchema = z.enum(['free', 'pro', 'enterprise']);
export const BillingCycleSchema = z.enum(['monthly', 'yearly']);

export const PlanLimitsSchema = z.object({
  teams: z.number().int().min(-1),
  members: z.number().int().min(-1),
  storage: z.number().int().min(1),
  apiCalls: z.number().int().min(1),
});

// Schemas de organização
export const OrganizationSchema = z.object({
  name: z.string().min(2).max(50),
  slug: SlugSchema,
  description: z.string().max(200).optional(),
});

// Schemas de arquivo
export const FileInfoSchema = z.object({
  name: z.string().min(1),
  size: z.number().positive(),
  type: z.string().min(1),
  extension: z.string(),
});

// Tipos inferidos dos schemas
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type PreferencesInput = z.infer<typeof PreferencesSchema>;
export type OrganizationInput = z.infer<typeof OrganizationSchema>;
export type FileInfoInput = z.infer<typeof FileInfoSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type PlanId = z.infer<typeof PlanIdSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type Language = z.infer<typeof LanguageSchema>;
