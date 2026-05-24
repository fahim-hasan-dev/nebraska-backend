import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IEventRegistration } from './eventRegistration.interface';
import { EventRegistrationModel } from './eventRegistration.model';
import { EventModel } from '../event/event.model';
import { User } from '../user/user.model';
import { JwtPayload } from 'jsonwebtoken';

// Create a new event registration
const createEventRegistration = async (user:JwtPayload,payload: IEventRegistration): Promise<IEventRegistration> => {
  const event = await EventModel.findById(payload.event);
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  // check if class exists in event classes array
  const classExists = event.class.some((c) => c.name === payload.class);
  if (!classExists) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Class '${payload.class}' not found in event`);
  }

  const driver = await User.findById(user.authId);
  if (!driver) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Driver not found');
  }
  payload.driver = driver._id;

  // check if duplicate request exists
  const existingRegistration = await EventRegistrationModel.findOne({
    event: payload.event,
    driver: driver._id,
    class: payload.class,
  });

  if (existingRegistration) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You already registered this class for the event');
  }

  const result = await EventRegistrationModel.create(payload);
  return result;
};

// Get all event registrations
const getAllEventRegistrations = async (query: Record<string, unknown>) => {
  let searchFilters: any = {};

  if (query.searchTerm) {
    const searchTerm = query.searchTerm as string;

    // Find drivers matching search criteria
    const matchingDrivers = await User.find({
      $or: [
        { fullName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } }
      ]
    }).select('_id');
    const driverIds = matchingDrivers.map(d => d._id);

    // Find events matching search criteria
    const matchingEvents = await EventModel.find({
      name: { $regex: searchTerm, $options: 'i' }
    }).select('_id');
    const eventIds = matchingEvents.map(e => e._id);

    searchFilters = {
      $or: [
        { driver: { $in: driverIds } },
        { event: { $in: eventIds } }
      ]
    };
    delete query.searchTerm;
  }

  const baseQuery = EventRegistrationModel.find(searchFilters);
  const registrationQueryBuilder = new QueryBuilder(baseQuery, query)
    .filter()
    .sort()
    .paginate()
    .fields()
    .populate(['event', 'driver'], {
      event: 'name date time venue',
      driver: 'fullName email phone image vehicleName',
    });

  const registrations = await registrationQueryBuilder.modelQuery.lean();
  const paginationInfo = await registrationQueryBuilder.getPaginationInfo();

  return {
    data: registrations,
    meta: paginationInfo,
  };
};

// Get registration by ID
const getEventRegistrationById = async (id: string): Promise<IEventRegistration> => {
  const result = await EventRegistrationModel.findById(id).populate([
    { path: 'event', select: 'name date time venue' },
    { path: 'driver', select: 'fullName email phone image vehicleName' },
  ]);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event registration not found');
  }
  return result;
};

// Update registration status
const updateEventRegistrationStatus = async (id: string, status: string): Promise<IEventRegistration> => {
  const registration = await EventRegistrationModel.findById(id);
  if (!registration) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event registration not found');
  }

  registration.status = status as 'pending' | 'approved' | 'rejected';
  await registration.save();
  return registration;
};

// Delete/withdraw a registration
const deleteEventRegistration = async (id: string): Promise<IEventRegistration> => {
  const registration = await EventRegistrationModel.findById(id);
  if (!registration) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event registration not found');
  }

  const result = await EventRegistrationModel.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete registration');
  }
  return result;
};

// Perform random drawing for approved registrations in a class
const drawRegistrations = async (eventId: string, className: string): Promise<IEventRegistration[]> => {
  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  const classExists = event.class.some((c) => c.name === className);
  if (!classExists) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Class '${className}' not found in event`);
  }

  const registrations = await EventRegistrationModel.find({
    event: eventId,
    class: className,
    status: 'approved', 
  });

  if (registrations.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No approved registrations found for this class to draw');
  }

  // Fisher-Yates shuffle
  const shuffled = [...registrations];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Save sequential positions
  const savedRegistrations = await Promise.all(
    shuffled.map((reg, index) => {
      const regDoc = reg as any;
      regDoc.drawPosition = index + 1;
      return reg.save();
    })
  );

  // Return sorted by drawPosition
  return savedRegistrations.sort((a, b) => {
    const posA = (a as any).drawPosition || 0;
    const posB = (b as any).drawPosition || 0;
    return posA - posB;
  });
};

// Reset/cancel all draw positions for a class in an event
const cancelDrawRegistrations = async (eventId: string, className: string) => {
  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  const result = await EventRegistrationModel.updateMany(
    { event: eventId, class: className },
    { $set: { drawPosition: null } }
  );

  return result;
};

// Admin manually registers a driver directly with approved status
const adminAddEventRegistration = async (payload: IEventRegistration): Promise<IEventRegistration> => {
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
  if (driver.role !== 'driver') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Specified user is not a driver');
  }

  // check if duplicate request exists
  const existingRegistration = await EventRegistrationModel.findOne({
    event: payload.event,
    driver: payload.driver,
    class: payload.class,
  });

  if (existingRegistration) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Driver is already registered for this class in the event');
  }

  // Set status directly to approved
  payload.status = 'approved';

  const result = await EventRegistrationModel.create(payload);
  return result;
};

export const EventRegistrationServices = {
  createEventRegistration,
  getAllEventRegistrations,
  getEventRegistrationById,
  updateEventRegistrationStatus,
  deleteEventRegistration,
  drawRegistrations,
  cancelDrawRegistrations,
  adminAddEventRegistration,
};
