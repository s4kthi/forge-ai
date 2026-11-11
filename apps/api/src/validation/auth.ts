import { z } from "zod";

export const emailInput = z.string().trim().max(254).email().transform((email) => email.toLowerCase());
export const loginInput = z.strictObject({ email: emailInput, password: z.string().min(1).max(128) });
export const registerInput = loginInput.extend({
  name: z.string().trim().min(1).max(120),
  password: z.string().min(15, "Use at least 15 characters.").max(128),
});

export type LoginInput = z.output<typeof loginInput>;
export type RegisterInput = z.output<typeof registerInput>;
