import { Types } from "mongoose";

export interface IClass {
  name: string;
  status: 'pending' | 'live' | 'completed';
}

// GeoJSON Point location interface
export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; 
}

// Represents an Event in our app
export interface IEvent {
  _id?: Types.ObjectId;
  name: string;
  date: Date;
  time: string;
  venue: string;
  location: ILocation; 
  additionalInfo?: string;
  pictures: string[]; 
  class: IClass[];
  entryFee: number;
  isRegistered?: boolean;
}
