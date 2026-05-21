import { Types } from 'mongoose';

// Represents event sponsors
export interface ISponsor {
  _id?: Types.ObjectId;
  name: string;
  type: 'platinum' | 'gold' | 'silver';
  image: string;
  isActive: boolean;
}
