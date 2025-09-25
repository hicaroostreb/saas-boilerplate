import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Email inválido')
  .max(255, 'Email muito longo');

export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(100, 'Senha muito longa')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Senha deve conter pelo menos uma letra minúscula, maiúscula e um número'
  );

export const nameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo');

export const teamNameSchema = z
  .string()
  .min(2, 'Nome do time deve ter pelo menos 2 caracteres')
  .max(50, 'Nome do time muito longo');

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Form validation schemas
export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const createTeamSchema = z.object({
  name: teamNameSchema,
});

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(['admin', 'member']),
});
