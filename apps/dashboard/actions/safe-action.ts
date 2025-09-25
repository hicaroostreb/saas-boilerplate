import { createSafeActionClient } from "next-safe-action"
import { redirect } from "next/navigation"
import { auth } from "@workspace/auth"

// Cliente base - sem autenticação
export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action error:", e)
    return "An unexpected error occurred"
  },
})

// Cliente com autenticação obrigatória
export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/auth/sign-in")
  }
  
  return next({ 
    ctx: {
      session,
      user: session.user,
    }
  })
})

// Cliente com autenticação + organização (para futuro)
export const authOrganizationActionClient = authActionClient.use(async ({ next, ctx }) => {
  // TODO: Implementar lógica de organização quando necessário
  // Por ora, usa só o contexto de auth
  
  return next({
    ctx: {
      ...ctx,
      // organization: ..., // Implementar quando houver organizações
    }
  })
})
