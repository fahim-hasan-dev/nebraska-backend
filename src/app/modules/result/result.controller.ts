import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ResultServices } from './result.service';

// Record driver pull result
const createResult = catchAsync(async (req: Request, res: Response) => {
  const result = await ResultServices.createResult(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Result recorded successfully',
    data: result,
  });
});

// Get all recorded results
const getAllResults = catchAsync(async (req: Request, res: Response) => {
  const result = await ResultServices.getAllResults(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Results retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Retrieve details for a result by ID
const getResultById = catchAsync(async (req: Request, res: Response) => {
  const result = await ResultServices.getResultById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Result details retrieved successfully',
    data: result,
  });
});

// Update a result entry
const updateResult = catchAsync(async (req: Request, res: Response) => {
  const result = await ResultServices.updateResult(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Result updated successfully',
    data: result,
  });
});

// Delete a result entry
const deleteResult = catchAsync(async (req: Request, res: Response) => {
  await ResultServices.deleteResult(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Result deleted successfully',
  });
});

export const ResultController = {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
};
