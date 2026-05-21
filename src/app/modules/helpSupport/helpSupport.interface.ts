import { Types } from 'mongoose';

// Represents user help & support tickets
export interface IHelpSupport {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  description: string;
  file?: string | null;
  status: 'pending' | 'resolved' | 'rejected';
  reply?: string; 
  createdAt?: Date;
  updatedAt?: Date;
}
