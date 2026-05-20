import { z } from 'zod';

// Validates submitting a sponsor inquiry
const createSponsorRequestZodSchema = z.object({
  body: z.object({
    businessName: z.string({ required_error: 'Business name is required' }).min(1, 'Business name cannot be empty'),
    message: z.string({ required_error: 'Message context is required' }).min(1, 'Message cannot be empty'),
  }),
});

// Validates updating sponsor request status
const updateSponsorRequestStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'accepted', 'declined'], {
      required_error: 'Status is required',
    }),
  }),
});

export const SponsorRequestValidations = {
  createSponsorRequestZodSchema,
  updateSponsorRequestStatusZodSchema,
};
