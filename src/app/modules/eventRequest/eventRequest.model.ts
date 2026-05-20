import { Schema, model } from 'mongoose';
import { IEventRequest } from './eventRequest.interface';

// Event Request Schema
const eventRequestSchema = new Schema<IEventRequest>(
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
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // Automatically tracks creation and updates
  }
);

export const EventRequestModel = model<IEventRequest>('EventRequest', eventRequestSchema);
