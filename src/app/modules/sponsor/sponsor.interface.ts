import { Types } from 'mongoose';

// Represents event sponsors
export interface ISponsor {
  _id?: Types.ObjectId;
  name: string; // Sponsor business name
  tier: 'platinum' | 'gold' | 'silver'; // Sponsor package level
  image: string; // File path of the sponsor logo
  isActive: boolean; // Display on public website status
}
