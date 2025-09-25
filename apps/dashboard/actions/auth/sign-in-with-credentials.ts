"use server"

import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db, users } from "@workspace/database"
import { verifyPassword, signIn } from "@workspace/auth"
import { actionClient } from "../safe-action"
import { signInSchema } from "../../schemas/auth/sign-in-schema"

export const signInWithCredentials = actionClient
  .schema(signInSchema)
  .action(async ({ parsedInput }) => {
    const { email, password } = parsedInput

    // Verificar se o usuário existe
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      throw new Error("Invalid email or password")
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(password, user.passwordHash)
    
    if (!isValidPassword) {
      throw new Error("Invalid email or password")
    }

    // Fazer login usando Auth.js
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    // Redirecionar após sucesso
    redirect("/dashboard")
  })
