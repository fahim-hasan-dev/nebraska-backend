import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IEventRequest } from './eventRequest.interface';
import { EventRequestModel } from './eventRequest.model';
import { EventModel } from '../event/event.model';
import { User } from '../user/user.model';

// Create a new event request
const createEventRequest = async (payload: IEventRequest): Promise<IEventRequest> => {
  const event = await EventModel.findById(payload.event);
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  // check if class exists in event classes array
  const classExists = event.class.some((c) => c.name === payload.class);
  if (!classExists) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Class '${payload.class}' not found in event`);
  }

  const driver = await User.findById(payload.driver);
  if (!driver) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Driver not found');
  }

  // check if duplicate request exists
  const existingRequest = await EventRequestModel.findOne({
    event: payload.event,
    driver: payload.driver,
    class: payload.class,
  });

  if (existingRequest) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You already requested this class for the event');
  }

  const result = await EventRequestModel.create(payload);
  return result;
};

// Get all event requests
const getAllEventRequests = async (query: Record<string, unknown>) => {
  const requestQueryBuilder = new QueryBuilder(EventRequestModel.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields()
    .populate(['event', 'driver']);

  const requests = await requestQueryBuilder.modelQuery.lean();
  const paginationInfo = await requestQueryBuilder.getPaginationInfo();

  return {
    data: requests,
    meta: paginationInfo,
  };
};

// Get request by ID
const getEventRequestById = async (id: string): Promise<IEventRequest> => {
  const result = await EventRequestModel.findById(id).populate(['event', 'driver']);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event request not found');
  }
  return result;
};

// Update request status
const updateEventRequestStatus = async (id: string, status: string): Promise<IEventRequest> => {
  const request = await EventRequestModel.findById(id);
  if (!request) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event request not found');
  }

  request.status = status as 'pending' | 'accepted' | 'declined';
  await request.save();
  return request;
};

// Delete/withdraw a request
const deleteEventRequest = async (id: string): Promise<IEventRequest> => {
  const request = await EventRequestModel.findById(id);
  if (!request) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event request not found');
  }

  const result = await EventRequestModel.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete request');
  }
  return result;
};

export const EventRequestServices = {
  createEventRequest,
  getAllEventRequests,
  getEventRequestById,
  updateEventRequestStatus,
  deleteEventRequest,
};
