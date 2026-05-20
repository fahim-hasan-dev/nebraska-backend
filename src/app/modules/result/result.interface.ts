import { Types } from 'mongoose';

// Represents event pull results for driver vehicle class
export interface IResult {
  _id?: Types.ObjectId;
  driver: Types.ObjectId; 
  distance: number;
  event: Types.ObjectId;
  class: string; 
}
