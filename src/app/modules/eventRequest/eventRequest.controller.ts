import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { EventRequestServices } from './eventRequest.service';
import { JwtPayload } from 'jsonwebtoken';

// Submit a new request to join an event class
const createEventRequest = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const payload = {
    ...req.body,
    driver: user.userId, // use logged in driver id
  };

  const result = await EventRequestServices.createEventRequest(payload);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Event request submitted successfully',
    data: result,
  });
});

// Retrieve all requests with self-filtering for drivers
const getAllEventRequests = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const query = { ...req.query };

  // drivers only see their own requests
  if (user.role === 'driver') {
    query.driver = user.userId;
  }

  const result = await EventRequestServices.getAllEventRequests(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event requests retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Retrieve request details by ID
const getEventRequestById = catchAsync(async (req: Request, res: Response) => {
  const result = await EventRequestServices.getEventRequestById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event request details retrieved successfully',
    data: result,
  });
});

// Update request status (Admin only)
const updateEventRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await EventRequestServices.updateEventRequestStatus(id, status);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Event request status updated to ${status}`,
    data: result,
  });
});

// Withdraw or delete request
const deleteEventRequest = catchAsync(async (req: Request, res: Response) => {
  await EventRequestServices.deleteEventRequest(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event request withdrawn successfully',
  });
});

export const EventRequestController = {
  createEventRequest,
  getAllEventRequests,
  getEventRequestById,
  updateEventRequestStatus,
  deleteEventRequest,
};
