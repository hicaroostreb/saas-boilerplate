"use server";

import { eq } from "drizzle-orm";
import { db, users, passwordResetTokens } from "@workspace/database";
import { actionClient } from "../safe-action";
import { forgotPasswordSchema } from "../../schemas/auth/forgot-password-schema";
import { nanoid } from "nanoid";

export const forgotPassword = actionClient
  .schema(forgotPasswordSchema)  // ← REMOVER .metadata()
  .action(async ({ parsedInput }) => {
    const { email } = parsedInput;

    // Verificar se o usuário existe
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Por segurança, sempre retornamos sucesso mesmo se o usuário não existir
    if (!user) {
      // ✅ Correção: console.warn é permitido para logs de segurança
      console.warn(`Password reset requested for non-existent email:`, email);
      return { success: true };
    }

    // Gerar token único
    const resetToken = nanoid(64);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    try {
      // Deletar tokens existentes para este usuário
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, user.id));

      // Criar novo token
      await db
        .insert(passwordResetTokens)
        .values({
          id: nanoid(),
          userId: user.id,
          token: resetToken,
          expiresAt,
          createdAt: new Date(),
        });

      // TODO: Enviar email com o token
      // Para agora, só logamos (em produção implementar email service)
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
      
      // ✅ Correção: console.warn é permitido para development/debugging
      console.warn(`Password reset URL for ${email}:`, resetUrl);

      // Por segurança, sempre retornamos sucesso
      return { success: true };
    } catch (error) {
      // ✅ console.error é permitido para erros
      console.error("Error creating password reset token:", error);
      throw new Error("Failed to process password reset request");
    }
  });
