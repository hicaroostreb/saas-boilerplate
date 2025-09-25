"use server";

import { signOut } from "@workspace/auth";
import { authActionClient } from "../safe-action";
import { z } from "zod";

// Schema vazio para sign out
const emptySchema = z.object({});

export const signOutAction = authActionClient
  .schema(emptySchema)
  .action(async ({ ctx }) => {
    // ✅ Correção: console.warn é permitido para auditoria de segurança
    console.warn("User signing out:", ctx.user.email);
    
    try {
      await signOut({
        redirectTo: "/auth/sign-in",
      });
    } catch (error) {
      // ✅ console.error é permitido para tratamento de erros
      console.error("Error during sign out:", error);
      throw new Error("Failed to sign out");
    }
  });
