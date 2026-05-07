import { z } from "zod";

// Auth schemas live in one place so the login and signup forms can share the same validation rules.
export const signupSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(30, "Name must be at most 30 characters long"),
    email: z.email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    image: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
        message: "Image must be less than 5MB",
      })
      .refine((file) => !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type), {
        message: "Only JPEG, PNG, and WebP images are allowed",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Login only needs credentials, so the schema stays intentionally small.
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Password reset requests only need an email address because the actual reset happens by email link.
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Reset password requires confirmation so users do not accidentally lock themselves out with a typo.
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
