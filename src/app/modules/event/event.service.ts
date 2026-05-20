import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IEvent } from './event.interface';
import { EventModel } from './event.model';

// Create a new event
const createEvent = async (payload: IEvent): Promise<IEvent> => {
  const result = await EventModel.create(payload);
  return result;
};

// Retrieve all events with filters, pagination and search
const getAllEvents = async (query: Record<string, unknown>) => {
  const eventQueryBuilder = new QueryBuilder(EventModel.find(), query)
    .search(['name', 'venue']) // search by name or venue
    .filter()
    .sort()
    .fields()
    .paginate();

  const events = await eventQueryBuilder.modelQuery.lean();
  const paginationInfo = await eventQueryBuilder.getPaginationInfo();

  return {
    data: events,
    meta: paginationInfo,
  };
};

// Get a single event by ID
const getEventById = async (id: string): Promise<IEvent> => {
  const result = await EventModel.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }
  return result;
};

// Update event details
const updateEvent = async (id: string, payload: Partial<IEvent>): Promise<IEvent> => {
  const existingEvent = await EventModel.findById(id);
  if (!existingEvent) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  const result = await EventModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update event');
  }

  return result;
};

// Delete an event
const deleteEvent = async (id: string): Promise<IEvent> => {
  const existingEvent = await EventModel.findById(id);
  if (!existingEvent) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  const result = await EventModel.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete event');
  }

  return result;
};

export const EventServices = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
