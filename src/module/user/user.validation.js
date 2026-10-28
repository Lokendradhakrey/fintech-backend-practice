import { z } from "zod";

export const createUserSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must contain at least 2 characters")
      .max(100, "Full name cannot exceed 50 characters"),

    phone: z
      .string()
      .trim()
      .regex(
        /^[6-9]\d{9}$/,
        "Please provide a valid 10-digit Indian mobile number",
      ),

    email: z
      .email({
        error: "Please provide a valid email address",
      })
      .trim(),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(
        /^[A-Z](?=.*\d)(?=.*[^A-Za-z0-9\s])\S*$/,
        "Password must start with a capital letter and contain at least one number and one special character",
      ),
  })
  .strict();
