import { Schema, model } from 'mongoose';
import { IEventRegistration } from './eventRegistration.interface';

// Event Registration Schema
const eventRegistrationSchema = new Schema<IEventRegistration>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Driver ID is required'],
    },
    class: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    drawPosition: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically tracks creation and updates
  }
);

export const EventRegistrationModel = model<IEventRegistration>('EventRegistration', eventRegistrationSchema);
