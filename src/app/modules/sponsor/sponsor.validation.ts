import { z } from 'zod';

// Validates creating a new sponsor
const createSponsorZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Sponsor name is required' }).min(1, 'Name cannot be empty'),
    tier: z.enum(['platinum', 'gold', 'silver'], { required_error: 'Sponsor tier is required' }),
    image: z.string({ required_error: 'Sponsor logo is required' }).min(1, 'Logo path cannot be empty'),
    isActive: z.boolean().optional(),
  }),
});

// Validates updating an existing sponsor
const updateSponsorZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    tier: z.enum(['platinum', 'gold', 'silver']).optional(),
    image: z.string().min(1, 'Logo path cannot be empty').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const SponsorValidations = {
  createSponsorZodSchema,
  updateSponsorZodSchema,
};
