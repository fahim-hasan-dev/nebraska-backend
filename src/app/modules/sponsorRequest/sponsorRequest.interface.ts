import { Types } from 'mongoose';

// Represents inquiries to become event sponsors
export interface ISponsorRequest {
  _id?: Types.ObjectId;
  businessName: string; // Business name of the prospective sponsor
  user: Types.ObjectId; // References the prospective User
  message: string; // Detail context/message from user
  status: 'pending' | 'accepted' | 'declined'; // Inquiry request review status
}
