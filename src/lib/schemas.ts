// ─── Zod Schemas ─────────────────────────────────────────────────────────────
// Shared validation schemas used by React Hook Form + Zod across all forms.

import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    role: z.enum(["attendee", "organizer"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Event ────────────────────────────────────────────────────────────────────
export const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Event date is required"),
  endDate: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  type: z.enum(["in-person", "online"]),
  capacity: z.coerce
    .number()
    .int()
    .min(1, "Capacity must be at least 1"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional().default([]),
});

// ─── RSVP ─────────────────────────────────────────────────────────────────────
export const rsvpSchema = z.object({
  formResponses: z.array(
    z.object({
      question: z.string(),
      answer: z.string().min(1, "This field is required"),
    })
  ),
});

// ─── Types inferred from schemas ──────────────────────────────────────────────
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
