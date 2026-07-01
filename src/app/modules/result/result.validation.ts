import { z } from 'zod';

// Validates creating a new result entry
const createResultZodSchema = z.object({
  body: z.object({
    driver: z.string({ required_error: 'Driver ID is required' }),
    distance: z.number({ required_error: 'Distance is required' }).nonnegative('Distance cannot be negative'),
    point: z.number({ required_error: 'Points are required' }).nonnegative('Points cannot be negative'),
    event: z.string({ required_error: 'Event ID is required' }),
    class: z.string({ required_error: 'Class name is required' }).min(1, 'Class name cannot be empty'),
  }),
});

// Validates updating an existing result entry
const updateResultZodSchema = z.object({
  body: z.object({
    driver: z.string().optional(),
    distance: z.number().nonnegative('Distance cannot be negative').optional(),
    point: z.number().nonnegative('Points cannot be negative').optional(),
    event: z.string().optional(),
    class: z.string().min(1, 'Class name cannot be empty').optional(),
  }),
});

export const ResultValidations = {
  createResultZodSchema,
  updateResultZodSchema,
};
