import { z } from 'zod';

// Validation rules for submitting a registration
const createEventRegistrationZodSchema = z.object({
  body: z.object({
    event: z.string({ required_error: 'Event ID is required' }),
    class: z.string({ required_error: 'Class name is required' }).min(1, 'Class cannot be empty'),
    note: z.string().optional(),
  }),
});

// Validation rules for updating status
const updateEventRegistrationStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected'], {
      required_error: 'Status is required',
    }),
  }),
});

// Validation rules for drawing requests or canceling draw
const drawEventRegistrationZodSchema = z.object({
  body: z.object({
    eventId: z.string({ required_error: 'Event ID is required' }),
    class: z.string({ required_error: 'Class name is required' }).min(1, 'Class cannot be empty'),
  }),
});

// Validation rules for Admin to manually add a driver registration
const adminAddRegistrationZodSchema = z.object({
  body: z.object({
    event: z.string({ required_error: 'Event ID is required' }),
    driver: z.string({ required_error: 'Driver ID is required' }),
    class: z.string({ required_error: 'Class name is required' }).min(1, 'Class cannot be empty'),
    note: z.string().optional(),
  }),
});

export const EventRegistrationValidations = {
  createEventRegistrationZodSchema,
  updateEventRegistrationStatusZodSchema,
  drawEventRegistrationZodSchema,
  adminAddRegistrationZodSchema,
};
