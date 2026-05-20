import { Types } from 'mongoose';

// Represents driver registration requests to join event classes
export interface IEventRegistration {
  _id?: Types.ObjectId;
  event: Types.ObjectId;
  driver: Types.ObjectId;
  class: string;
  status: 'pending' | 'approved' | 'rejected';
  drawPosition?: number | null;
}
