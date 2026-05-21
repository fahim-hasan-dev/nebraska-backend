import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SponsorServices } from './sponsor.service';

// Add a new sponsor
const createSponsor = catchAsync(async (req: Request, res: Response) => {
  const result = await SponsorServices.createSponsor(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Sponsor added successfully',
    data: result,
  });
});

// Retrieve all sponsors
const getAllSponsors = catchAsync(async (req: Request, res: Response) => {
  const result = await SponsorServices.getAllSponsors(req.query, req.user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sponsors retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Retrieve detailed sponsor by ID
const getSponsorById = catchAsync(async (req: Request, res: Response) => {
  const result = await SponsorServices.getSponsorById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sponsor details retrieved successfully',
    data: result,
  });
});

// Update an existing sponsor details
const updateSponsor = catchAsync(async (req: Request, res: Response) => {
  const result = await SponsorServices.updateSponsor(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sponsor updated successfully',
    data: result,
  });
});

// Delete a sponsor details
const deleteSponsor = catchAsync(async (req: Request, res: Response) => {
  await SponsorServices.deleteSponsor(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sponsor deleted successfully',
  });
});

export const SponsorController = {
  createSponsor,
  getAllSponsors,
  getSponsorById,
  updateSponsor,
  deleteSponsor,
};
