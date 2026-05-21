import { Schema, model } from 'mongoose';
import { IHelpSupport } from './helpSupport.interface';

// HelpSupport Schema
const helpSupportSchema = new Schema<IHelpSupport>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
    },
    file: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'rejected'],
      default: 'pending',
    },
    reply: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

export const HelpSupportModel = model<IHelpSupport>('HelpSupport', helpSupportSchema);
