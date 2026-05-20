import { Schema, model } from 'mongoose';
import { ISponsor } from './sponsor.interface';

// Sponsor Schema
const sponsorSchema = new Schema<ISponsor>(
  {
    name: {
      type: String,
      required: [true, 'Sponsor name is required'],
      trim: true,
    },
    tier: {
      type: String,
      enum: ['platinum', 'gold', 'silver'],
      required: [true, 'Sponsor tier is required'],
    },
    image: {
      type: String,
      required: [true, 'Sponsor logo is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Tracks creation and updates
  }
);

export const SponsorModel = model<ISponsor>('Sponsor', sponsorSchema);
