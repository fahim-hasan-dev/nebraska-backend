import { Types } from 'mongoose';

// Represents event pull results for driver vehicle class
export interface IResult {
  _id?: Types.ObjectId;
  driver: Types.ObjectId; // References the driver User
  distance: number; // Distance pulled in feet
  event: Types.ObjectId; // References the Event
  class: string; // The class name in the event
}
