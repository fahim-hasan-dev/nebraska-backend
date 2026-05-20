import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { EventServices } from './event.service';

// Handles creating a new event
const createEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventServices.createEvent(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Event created successfully',
    data: result,
  });
});

// Handles getting all events
const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await EventServices.getAllEvents(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Events retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Handles getting a single event by ID
const getEventById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EventServices.getEventById(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event details retrieved successfully',
    data: result,
  });
});

// Handles updating an event's details
const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EventServices.updateEvent(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event updated successfully',
    data: result,
  });
});

// Handles deleting an event
const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await EventServices.deleteEvent(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Event deleted successfully',
  });
});

export const EventController = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
