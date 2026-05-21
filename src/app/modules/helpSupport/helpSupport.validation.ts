import { z } from 'zod';

// Validates submitting a help & support ticket
const createHelpSupportZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Issue title is required' }).min(1, 'Title cannot be empty'),
    description: z.string({ required_error: 'Issue description is required' }).min(1, 'Description cannot be empty'),
    image: z.string().optional(),
    file: z.string().optional(),
  }),
});

// Validates resolving a support ticket
const updateHelpSupportStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'resolved', 'rejected'], {
      required_error: 'Status is required',
    }),
    reply: z.string({
      required_error: 'Reply note is required when resolving support tickets',
    }).min(1, 'Reply note cannot be empty'),
  }),
});

export const HelpSupportValidations = {
  createHelpSupportZodSchema,
  updateHelpSupportStatusZodSchema,
};
