import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SponsorRequestServices } from './sponsorRequest.service';
import { JwtPayload } from 'jsonwebtoken';

// Submit a new sponsor request inquiry
const createSponsorRequest = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const payload = {
    ...req.body,
    user: user.authId, // Link with current logged in user
  };

  const result = await SponsorRequestServices.createSponsorRequest(payload);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Sponsor request submitted successfully',
    data: result,
  });
});

// Retrieve all sponsor request inquiries (with owner self-filter)
const getAllSponsorRequests = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const query = { ...req.query };

  // Non-admins see only their own requests
  if (user.role !== 'admin') {
    query.user = user.authId;
  }

  const result = await SponsorRequestServices.getAllSponsorRequests(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sponsor requests retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Retrieve detailed sponsor request by ID
const getSponsorRequestById = catchAsync(async (req: Request, res: Response) => {
  const result = await SponsorRequestServices.getSponsorRequestById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sponsor request details retrieved successfully',
    data: result,
  });
});

// Update sponsor request status (Admin only)
const updateSponsorRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await SponsorRequestServices.updateSponsorRequestStatus(id, status);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Sponsor request status updated to ${status}`,
    data: result,
  });
});

// Delete/withdraw a sponsor request inquiry
const deleteSponsorRequest = catchAsync(async (req: Request, res: Response) => {
  await SponsorRequestServices.deleteSponsorRequest(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sponsor request withdrawn successfully',
  });
});

export const SponsorRequestController = {
  createSponsorRequest,
  getAllSponsorRequests,
  getSponsorRequestById,
  updateSponsorRequestStatus,
  deleteSponsorRequest,
};
