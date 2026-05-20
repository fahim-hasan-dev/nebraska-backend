import { Schema, model } from 'mongoose';
import { IResult } from './result.interface';

// Result Schema
const resultSchema = new Schema<IResult>(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Driver ID is required'],
    },
    distance: {
      type: Number,
      required: [true, 'Distance is required'],
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    class: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
  },
  {
    timestamps: true, // Tracks creation and updates
  }
);

export const ResultModel = model<IResult>('Result', resultSchema);
