import { Types } from 'mongoose';

// Represents driver requests to join event classes
export interface IEventRequest {
  _id?: Types.ObjectId;
  event: Types.ObjectId; // References the Event
  driver: Types.ObjectId; // References the User (driver role)
  class: string; // The class name in the event
  status: 'pending' | 'accepted' | 'declined'; // Request approval status
}
