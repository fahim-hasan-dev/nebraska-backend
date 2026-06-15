import { Schema, model } from 'mongoose';
import { IEvent, IClass, ILocation } from './event.interface';

// Nested class schema - no auto _id to keep it clean
const classSchema = new Schema<IClass>({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'live', 'completed'],
    default: 'pending'
  }
}, { 
  _id: false
});

// GeoJSON Point Location schema
const locationSchema = new Schema<ILocation>({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true
  },
  coordinates: {
    type: [Number],
    required: [true, 'Coordinates are required']
  }
}, {
  _id: false
});

// Main event schema
const eventSchema = new Schema<IEvent>({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
    trim: true
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required'],
    trim: true
  },
  location: {
    type: locationSchema,
    required: [true, 'Event venue location coordinates are required']
  },
  additionalInfo: {
    type: String,
    trim: true,
    default: ''
  },
  pictures: {
    type: [String]
  },
  entryFee: {
    type: Number,
    required: [true, 'Entry fee is required']
  },
  class: {
    type: [classSchema],
    required: [true, 'Classes list is required'],
    validate: {
      validator: function (val: IClass[]) {
        return val && val.length > 0;
      },
      message: 'At least one class is required for the event'
    }
  }
}, {
  timestamps: true // tracks createdAt and updatedAt
});

// Enable geospatial queries
eventSchema.index({ location: '2dsphere' });

// Export event model
export const EventModel = model<IEvent>('Event', eventSchema);
