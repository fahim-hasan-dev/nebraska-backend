import { z } from "zod";
import { USER_ROLES, USER_STATUS } from "./user.interface";

export const userSignupSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum([USER_ROLES.FAN, USER_ROLES.DRIVER]),
    vehicleName: z.string().optional(),
  })
});

export const userLoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    password: z.string().min(1, "Password is required"),
  })
});

export const userUpdateSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").trim().toLowerCase().optional(),
    fullName: z.string().min(1, "Full name is required").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    status: z.nativeEnum(USER_STATUS).optional(),
    verified: z.boolean().optional(),
    role: z.nativeEnum(USER_ROLES).optional(),
    vehicleName: z.string().optional(),
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
  })
});

export const createDriverSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    vehicleName: z.string().optional(),
  })
});

export const createAdminSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email("Invalid email address").toLowerCase().trim(),
    fullName: z.string({ required_error: 'Full name is required' }).min(1, "Full name is required"),
    phone: z.string({ required_error: 'Phone number is required' }).min(1, "Phone number is required"),
    address: z.string({ required_error: 'Address is required' }).min(1, "Address is required"),
    password: z.string({ required_error: 'Password is required' }).min(6, "Password must be at least 6 characters"),
  })
});

export const updateAdminStatusSchema = z.object({
  body: z.object({
    status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.RESTRICTED, USER_STATUS.DELETED], {
      required_error: 'Status is required and must be active, restricted, or deleted',
    }),
  })
});

export const UserValidations = {
  userSignupSchema,
  userLoginSchema,
  userUpdateSchema,
  changePasswordSchema,
  createDriverSchema,
  createAdminSchema,
  updateAdminStatusSchema,
};
