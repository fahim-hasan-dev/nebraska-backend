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

// Location coordinates validation schema (GeoJSON Point format)
const locationZodSchema = z.object({
  type: z.enum(['Point']).default('Point'),
  coordinates: z.array(z.number(), {
    required_error: 'Coordinates are required',
  }).length(2, 'Coordinates must be a coordinate pair [longitude, latitude]'),
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
    location: locationZodSchema,
    additionalInfo: z.string().optional().default(''),
    pictures: z.array(z.string()).min(1, 'At least one picture is required'),
    class: z.array(classZodSchema).min(1, 'At least one class is required'),
    entryFee: z.number({
      required_error: 'Entry fee is required',
    }).min(1, 'Entry fee cannot be less than 1'),
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
    location: locationZodSchema.optional(),
    additionalInfo: z.string().optional(),
    pictures: z.array(z.string()).optional(),
    class: z.array(classZodSchema).min(1).optional(),
    entryFee: z.number().min(1).optional(),
  }),
});

// Validation rules for adding a class
const addClassZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Class name is required',
    }).min(1, 'Class name cannot be empty'),
    status: z.enum(['pending', 'live', 'completed']).optional().default('pending'),
  }),
});

// Validation rules for updating class status
const updateClassStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'live', 'completed'], {
      required_error: 'Class status must be pending, live, or completed',
    }),
  }),
});

export const EventValidations = {
  createEventZodSchema,
  updateEventZodSchema,
  addClassZodSchema,
  updateClassStatusZodSchema,
};
