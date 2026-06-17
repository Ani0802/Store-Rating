import { z } from "zod";

// Password regex: 8-16 chars, at least one uppercase letter and at least one special character
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]).{8,16}$/;

export const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(16, "Password must be at most 16 characters")
  .refine(
    (val) => /[A-Z]/.test(val),
    "Password must contain at least one uppercase letter"
  )
  .refine(
    (val) => /[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]/.test(val),
    "Password must contain at least one special character"
  );

export const registerSchema = z.object({
  name: z
    .string()
    .min(20, "Name must be at least 20 characters")
    .max(60, "Name must be at most 60 characters"),
  email: z.string().email("Invalid email format"),
  address: z
    .string()
    .max(400, "Address must be at most 400 characters")
    .min(1, "Address is required"),
  password: passwordValidation,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: passwordValidation,
});

export const adminCreateUserSchema = z.object({
  name: z
    .string()
    .min(20, "Name must be at least 20 characters")
    .max(60, "Name must be at most 60 characters"),
  email: z.string().email("Invalid email format"),
  address: z
    .string()
    .max(400, "Address must be at most 400 characters")
    .min(1, "Address is required"),
  password: passwordValidation,
  role: z.enum(["ADMIN", "USER", "STORE_OWNER"], {
    errorMap: () => ({ message: "Role must be ADMIN, USER, or STORE_OWNER" }),
  }),
});

// Admin adds store details which creates both STORE_OWNER user and a Store
export const adminCreateStoreSchema = z.object({
  storeName: z
    .string()
    .min(20, "Store name must be at least 20 characters")
    .max(60, "Store name must be at most 60 characters"),
  storeEmail: z.string().email("Invalid store email format"),
  storeAddress: z
    .string()
    .max(400, "Store address must be at most 400 characters")
    .min(1, "Store address is required"),
  ownerName: z
    .string()
    .min(20, "Owner name must be at least 20 characters")
    .max(60, "Owner name must be at most 60 characters"),
  ownerEmail: z.string().email("Invalid owner email format"),
  ownerPassword: passwordValidation,
});

export const ratingSchema = z.object({
  score: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  storeId: z.string().uuid("Invalid store ID"),
});

export const updateRatingSchema = z.object({
  score: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
});
