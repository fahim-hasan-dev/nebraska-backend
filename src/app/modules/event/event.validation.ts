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
    pictures: z.array(z.string()).optional().default([]),
    class: z.array(classZodSchema).min(1, 'At least one class is required'),
    entryFee: z.number({
      required_error: 'Entry fee is required',
    }).min(1, 'Entry fee cannot be less than 1'),
  }).refine((bodyData) => {
    const { date, time } = bodyData;
    try {
      const datePart = date.includes('T') ? date.split('T')[0] : date;
      let timePart = time.trim();
      if (/am|pm/i.test(timePart)) {
        const match = timePart.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
        if (match) {
          let hours = parseInt(match[1]);
          const minutes = match[2];
          const ampm = match[3].toLowerCase();
          if (ampm === 'pm' && hours < 12) hours += 12;
          if (ampm === 'am' && hours === 12) hours = 0;
          timePart = `${String(hours).padStart(2, '0')}:${minutes}`;
        }
      }
      const timeMatch = timePart.match(/^(\d{2}):(\d{2})/);
      let finalTime = '00:00';
      if (timeMatch) {
        finalTime = `${timeMatch[1]}:${timeMatch[2]}`;
      }
      const combinedString = `${datePart}T${finalTime}:00`;
      const parsedDate = new Date(combinedString);
      if (isNaN(parsedDate.getTime())) {
        return new Date(date) >= new Date();
      }
      return parsedDate >= new Date();
    } catch (err) {
      return false;
    }
  }, {
    message: 'Event date and time cannot be in the past',
    path: ['date'],
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
