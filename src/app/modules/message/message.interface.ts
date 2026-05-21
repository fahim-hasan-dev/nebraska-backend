import { Types } from 'mongoose';

// Represents an announcement message posted by Admin for specific target roles
export interface IMessage {
  _id?: Types.ObjectId;
  title: string;
  message: string;
  userType: 'driver' | 'fan';
  createdAt?: Date;
  updatedAt?: Date;
}
