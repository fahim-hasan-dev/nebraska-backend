import { Schema, model } from 'mongoose';
import { IMessage } from './message.interface';

const messageSchema = new Schema<IMessage>(
  {
    title: {
      type: String,
      required: [true, 'Message title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message body is required'],
      trim: true,
    },
    userType: {
      type: String,
      enum: ['driver', 'fan'],
      required: [true, 'User type is required (driver or fan)'],
    },
  },
  {
    timestamps: true,
  }
);

export const MessageModel = model<IMessage>('Message', messageSchema);
