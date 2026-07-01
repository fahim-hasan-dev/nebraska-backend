import { Types } from 'mongoose';

// Represents event sponsors
export interface ISponsor {
  _id?: Types.ObjectId;
  name: string;
  image: string;
  isActive: boolean;
}
