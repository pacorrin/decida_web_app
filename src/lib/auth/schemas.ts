import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Ingresa tu nombre"),
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const verifySignupSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  code: z.string().length(6, "El código debe tener 6 dígitos"),
});

export const logInSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export const requestResetSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  code: z.string().length(6, "El código debe tener 6 dígitos"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type VerifySignupInput = z.infer<typeof verifySignupSchema>;
export type LogInInput = z.infer<typeof logInSchema>;
export type RequestResetInput = z.infer<typeof requestResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
