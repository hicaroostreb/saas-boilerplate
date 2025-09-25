import { z } from "zod"

export const forgotPasswordSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .trim(),
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
