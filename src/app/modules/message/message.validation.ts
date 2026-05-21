import { z } from 'zod';

const createMessageZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(1, 'Title cannot be empty'),
    message: z.string({ required_error: 'Message body is required' }).min(1, 'Message body cannot be empty'),
    userType: z.enum(['driver', 'fan'], { required_error: 'User type must be either driver or fan' }),
  }),
});

const updateMessageZodSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').optional(),
    message: z.string().min(1, 'Message body cannot be empty').optional(),
    userType: z.enum(['driver', 'fan']).optional(),
  }),
});

export const MessageValidations = {
  createMessageZodSchema,
  updateMessageZodSchema,
};
