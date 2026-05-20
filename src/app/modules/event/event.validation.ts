import { z } from 'zod';

// Validates nested event classes
const classZodSchema = z.object({
  name: z.string({
    required_error: 'Class name is required',
  }).min(1, 'Class name cannot be empty'),
  status: z.enum(['pending', 'live', 'completed'], {
    required_error: 'Class status must be pending, live, or completed',
  }).default('pending'),
});

// Validation rules for creating a new event
const createEventZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Event name is required',
    }).min(1, 'Event name cannot be empty'),
    date: z.string({
      required_error: 'Event date is required',
    }).refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format (e.g. ISO 8601 string)',
    }),
    time: z.string({
      required_error: 'Event time is required',
    }).min(1, 'Event time cannot be empty'),
    venue: z.string({
      required_error: 'Event venue is required',
    }).min(1, 'Event venue cannot be empty'),
    additionalInfo: z.string().optional().default(''),
    pictures: z.array(z.string()).optional().default([]),
    class: z.array(classZodSchema).min(1, 'At least one class is required'),
  }),
});

// Validation rules for updating an event
const updateEventZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format (e.g. ISO 8601 string)',
    }).optional(),
    time: z.string().optional(),
    venue: z.string().optional(),
    additionalInfo: z.string().optional(),
    pictures: z.array(z.string()).optional(),
    class: z.array(classZodSchema).min(1).optional(),
  }),
});

export const EventValidations = {
  createEventZodSchema,
  updateEventZodSchema,
};
