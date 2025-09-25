"use server"

import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db, users } from "@workspace/database"
import { hashPassword, signIn } from "@workspace/auth"
import { actionClient } from "../safe-action"
import { signUpSchema } from "../../schemas/auth/sign-up-schema"

export const signUpWithCredentials = actionClient
  .schema(signUpSchema)
  .action(async ({ parsedInput }) => {
    const { name, email, password } = parsedInput

    // Verificar se o usuário já existe
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser) {
      throw new Error("An account with this email already exists")
    }

    // Hash da senha
    const passwordHash = await hashPassword(password)

    // Criar usuário
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: "user", // Papel padrão
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    if (!newUser) {
      throw new Error("Failed to create account")
    }

    // Fazer login automático após registro
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    // Redirecionar para dashboard
    redirect("/dashboard")
  })
