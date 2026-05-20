import { Types } from 'mongoose';

// Represents inquiries to become event sponsors
export interface ISponsorRequest {
  _id?: Types.ObjectId;
  businessName: string;
  user: Types.ObjectId;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
}
