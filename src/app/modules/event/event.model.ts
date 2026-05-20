import { Schema, model } from 'mongoose';
import { IEvent, IClass } from './event.interface';

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
  additionalInfo: {
    type: String,
    trim: true,
    default: ''
  },
  pictures: {
    type: [String],
    default: []
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

// Export event model
export const EventModel = model<IEvent>('Event', eventSchema);
