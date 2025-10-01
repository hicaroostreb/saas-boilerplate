// packages/common/src/domain/user/validators/user.validators.ts

import { z } from 'zod';

/**
 * Schema para validação de email
 */
export const emailSchema = z
  .string()
  .email('Email inválido')
  .max(255, 'Email muito longo')
  .toLowerCase();

/**
 * Schema para validação de senha
 */
export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(100, 'Senha muito longa')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Senha deve conter pelo menos uma letra minúscula, maiúscula e um número'
  );

/**
 * Schema para validação de nome
 */
export const nameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo')
  .trim();

/**
 * Schema para validação de role de usuário
 */
export const userRoleSchema = z.enum(['owner', 'admin', 'member'], {
  message: 'Role deve ser owner, admin ou member',
});

/**
 * Schema para validação de status de usuário
 */
export const userStatusSchema = z.enum(
  ['active', 'inactive', 'pending', 'suspended'],
  {
    message: 'Status inválido',
  }
);

/**
 * Schema para criação de usuário
 */
export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema.optional(),
  role: userRoleSchema.default('member'),
  image: z.string().url('URL da imagem inválida').optional(),
});

/**
 * Schema para atualização de usuário
 */
export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  image: z.string().url('URL da imagem inválida').optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
});

/**
 * Schema para login
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

/**
 * Schema para registro
 */
export const signUpSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

/**
 * Schema para validação de tema
 */
export const themeSchema = z.enum(['light', 'dark', 'system'], {
  message: 'Tema deve ser light, dark ou system',
});

/**
 * Schema para validação de idioma
 */
export const languageSchema = z.enum(['pt-BR', 'en-US', 'es-ES'], {
  message: 'Idioma não suportado',
});

/**
 * Schema para validação de timezone
 */
export const timezoneSchema = z.string().min(1, 'Timezone é obrigatório');

/**
 * Schema para atualização de preferências
 */
export const updatePreferencesSchema = z.object({
  theme: themeSchema.optional(),
  language: languageSchema.optional(),
  timezone: timezoneSchema.optional(),
  dateFormat: z.enum(['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd']).optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
  emailNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

/**
 * Schema para redefinição de senha
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });
