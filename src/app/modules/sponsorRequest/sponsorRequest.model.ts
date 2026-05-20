import { Schema, model } from 'mongoose';
import { ISponsorRequest } from './sponsorRequest.interface';

// SponsorRequest Schema
const sponsorRequestSchema = new Schema<ISponsorRequest>(
  {
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    message: {
      type: String,
      required: [true, 'Message context is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // Tracks creation and updates
  }
);

export const SponsorRequestModel = model<ISponsorRequest>('SponsorRequest', sponsorRequestSchema);
