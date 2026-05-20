import { z } from 'zod';

// Validation rules for submitting a request
const createEventRequestZodSchema = z.object({
  body: z.object({
    event: z.string({ required_error: 'Event ID is required' }),
    class: z.string({ required_error: 'Class name is required' }).min(1, 'Class cannot be empty'),
  }),
});

// Validation rules for updating status
const updateEventRequestStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'accepted', 'declined'], {
      required_error: 'Status is required',
    }),
  }),
});

export const EventRequestValidations = {
  createEventRequestZodSchema,
  updateEventRequestStatusZodSchema,
};
