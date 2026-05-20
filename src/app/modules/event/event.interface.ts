import { Types } from "mongoose";

// A specific class in an event
export interface IClass {
  name: string;
  status: 'pending' | 'live' | 'completed';
}

// Represents an Event in our app
export interface IEvent {
  _id?: Types.ObjectId;
  name: string;
  date: Date;
  time: string;
  venue: string;
  additionalInfo?: string;
  pictures?: string[]; 
  class: IClass[];
}
