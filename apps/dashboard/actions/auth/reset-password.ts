"use server"

import { eq, and, sql } from "drizzle-orm"
import { db, users, passwordResetTokens } from "@workspace/database"
import { hashPassword } from "@workspace/auth"
import { actionClient } from "../safe-action"
import { resetPasswordSchema } from "../../schemas/auth/reset-password-schema"
import { redirect } from "next/navigation"

export const resetPassword = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput }) => {
    const { token, password } = parsedInput

    // Buscar token válido
    const [resetTokenRecord] = await db
      .select({
        id: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
        expiresAt: passwordResetTokens.expiresAt,
      })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          // Token ainda não expirou
          sql`${passwordResetTokens.expiresAt} > NOW()`
        )
      )
      .limit(1)

    if (!resetTokenRecord) {
      throw new Error("Invalid or expired reset token")
    }

    // Hash da nova senha
    const passwordHash = await hashPassword(password)

    // Atualizar senha do usuário
    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, resetTokenRecord.userId))

    // Deletar token usado
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, resetTokenRecord.id))

    // Redirecionar para login com mensagem de sucesso
    redirect("/auth/sign-in?message=password-reset-success")
  })
