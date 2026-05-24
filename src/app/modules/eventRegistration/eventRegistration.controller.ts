import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { EventRegistrationServices } from './eventRegistration.service';
import { JwtPayload } from 'jsonwebtoken';

// Submit a new registration to join an event class
const createEventRegistration = catchAsync(async (req: Request, res: Response) => {
  
  const result = await EventRegistrationServices.createEventRegistration(req.user, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Event registration submitted successfully',
    data: result,
  });
});

// Retrieve all registrations with self-filtering for drivers
const getAllEventRegistrations = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const query = { ...req.query };

  const result = await EventRegistrationServices.getAllEventRegistrations(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event registrations retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Retrieve registration details by ID
const getEventRegistrationById = catchAsync(async (req: Request, res: Response) => {
  const result = await EventRegistrationServices.getEventRegistrationById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event registration details retrieved successfully',
    data: result,
  });
});

// Update registration status (Admin only)
const updateEventRegistrationStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await EventRegistrationServices.updateEventRegistrationStatus(id, status);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Event registration status updated to ${status}`,
    data: result,
  });
});

// Withdraw or delete registration
const deleteEventRegistration = catchAsync(async (req: Request, res: Response) => {
  await EventRegistrationServices.deleteEventRegistration(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event registration withdrawn successfully',
  });
});

// Perform random drawing for approved registrations in a class
const drawRegistrations = catchAsync(async (req: Request, res: Response) => {
  const { eventId, class: className } = req.body;
  const result = await EventRegistrationServices.drawRegistrations(eventId, className);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event registration drawing positions randomized successfully',
    data: result,
  });
});

// Reset drawing positions for all registrations in a class
const cancelDrawRegistrations = catchAsync(async (req: Request, res: Response) => {
  const { eventId, class: className } = req.body;
  const result = await EventRegistrationServices.cancelDrawRegistrations(eventId, className);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event registration drawing positions reset successfully',
    data: result,
  });
});

export const EventRegistrationController = {
  createEventRegistration,
  getAllEventRegistrations,
  getEventRegistrationById,
  updateEventRegistrationStatus,
  deleteEventRegistration,
  drawRegistrations,
  cancelDrawRegistrations,
};
