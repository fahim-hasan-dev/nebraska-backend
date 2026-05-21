import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { HelpSupportServices } from './helpSupport.service';
import { JwtPayload } from 'jsonwebtoken';

// Submit a new support ticket
const createHelpSupport = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const attachment = req.body.image || req.body.file || req.body.pictures;
  const payload = {
    ...req.body,
    user: user.authId,
    file: attachment || null,
  };

  const result = await HelpSupportServices.createHelpSupport(payload, user.name || 'User');
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Support ticket submitted successfully',
    data: result,
  });
});

// Retrieve all support tickets (Admin sees all, others see only their own)
const getAllHelpSupports = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const query = { ...req.query };

  // Non-admins see only their own support tickets
  if (user.role !== 'admin') {
    query.user = user.authId;
  }

  const result = await HelpSupportServices.getAllHelpSupports(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Support tickets retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Retrieve detailed support ticket by ID
const getHelpSupportById = catchAsync(async (req: Request, res: Response) => {
  const result = await HelpSupportServices.getHelpSupportById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Support ticket details retrieved successfully',
    data: result,
  });
});

// Update support ticket status (Admin only)
const updateHelpSupportStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reply } = req.body;
  const result = await HelpSupportServices.updateHelpSupportStatus(id, status, reply);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Support ticket status updated to ${status}`,
    data: result,
  });
});

// Delete/withdraw support ticket
const deleteHelpSupport = catchAsync(async (req: Request, res: Response) => {
  await HelpSupportServices.deleteHelpSupport(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Support ticket withdrawn successfully',
  });
});

export const HelpSupportController = {
  createHelpSupport,
  getAllHelpSupports,
  getHelpSupportById,
  updateHelpSupportStatus,
  deleteHelpSupport,
};
