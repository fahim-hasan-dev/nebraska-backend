import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MessageServices } from './message.service';
import { JwtPayload } from 'jsonwebtoken';

// Add a new targeted message (Admin only)
const createMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await MessageServices.createMessage(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Message posted successfully',
    data: result,
  });
});

// Retrieve all messages (scoped per requester role)
const getAllMessages = catchAsync(async (req: Request, res: Response) => {
  const result = await MessageServices.getAllMessages(req.query, req.user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Messages retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Retrieve detailed message by ID
const getMessageById = catchAsync(async (req: Request, res: Response) => {
  const result = await MessageServices.getMessageById(req.params.id, req.user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message details retrieved successfully',
    data: result,
  });
});

// Update an existing message details (Admin only)
const updateMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await MessageServices.updateMessage(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message updated successfully',
    data: result,
  });
});

// Delete a message details (Admin only)
const deleteMessage = catchAsync(async (req: Request, res: Response) => {
  await MessageServices.deleteMessage(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message deleted successfully',
  });
});

export const MessageController = {
  createMessage,
  getAllMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
};
