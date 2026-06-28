import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IEvent } from './event.interface';
import { EventModel } from './event.model';
import { EventRegistrationModel } from '../eventRegistration/eventRegistration.model';
import { RedisHelper } from '../../../helpers/redis';

// Create a new event
const createEvent = async (payload: IEvent): Promise<IEvent> => {
  const result = await EventModel.create(payload);
  
  // Invalidate event lists
  await RedisHelper.deleteCachePattern('events:base:*');
  
  return result;
};

// Retrieve all events with filters, pagination and search
const getAllEvents = async (query: Record<string, unknown>, user?: any) => {
  // Support aliases for searching and filtering
  if (query.query) {
    query.searchTerm = query.query;
    delete query.query;
  }
  if (query.id) {
    query._id = query.id;
    delete query.id;
  }

  // Generate cache key for this query
  const cacheKey = RedisHelper.generateQueryKey('events:base', query);
  let cachedResult = await RedisHelper.getCache<{ data: any[]; meta: any }>(cacheKey);

  if (!cachedResult) {
    const eventQueryBuilder = new QueryBuilder(
      EventModel.find().select('name date time venue location entryFee class pictures additionalInfo'),
      query
    )
      .search(['name', 'venue']) 
      .filter()
      .sort()
      .fields()
      .paginate();

    const events = await eventQueryBuilder.modelQuery.lean();
    const paginationInfo = await eventQueryBuilder.getPaginationInfo();

    cachedResult = {
      data: events,
      meta: paginationInfo,
    };

    // Cache event list for 1 hour (3600 seconds)
    await RedisHelper.setCache(cacheKey, cachedResult, 3600);
  }

  const events = cachedResult.data;
  const paginationInfo = cachedResult.meta;

  // If user is a driver, check registration status for each event dynamically
  if (user && user.role === 'driver') {
    const driverId = user.authId; 

    // Extract just the event IDs for the current paginated page
    const eventIds = events.map((e: any) => e._id);

    // Find registrations ONLY for the current page's events
    const registeredEvents = await EventRegistrationModel.find({ 
      driver: driverId,
      event: { $in: eventIds }
    }).distinct('event');
    
    const registeredEventIds = registeredEvents.map(id => id.toString());

    const eventsWithRegistration = events.map((event: any) => ({
      ...event,
      isRegistered: registeredEventIds.includes(event._id.toString()),
    }));

    return {
      data: eventsWithRegistration,
      meta: paginationInfo,
    };
  }

  return {
    data: events,
    meta: paginationInfo,
  };
};

// Get a single event by ID
const getEventById = async (id: string, user?: any): Promise<IEvent> => {
  const cacheKey = `event:detail:${id}`;
  let eventData = await RedisHelper.getCache<any>(cacheKey);

  if (!eventData) {
    const result = await EventModel.findById(id).lean();
    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
    }
    eventData = result;
    // Cache event details for 1 hour (3600 seconds)
    await RedisHelper.setCache(cacheKey, eventData, 3600);
  }

  const responseData = { ...eventData } as IEvent;

  if (user && user.role === 'driver') {
    const isRegistered = await EventRegistrationModel.findOne({
      driver: user.authId,
      event: id,
    });
    responseData.isRegistered = !!isRegistered;
  }

  return responseData;
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

  // Invalidate caches
  await RedisHelper.deleteCache(`event:detail:${id}`);
  await RedisHelper.deleteCachePattern('events:base:*');

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

  // Invalidate caches
  await RedisHelper.deleteCache(`event:detail:${id}`);
  await RedisHelper.deleteCachePattern('events:base:*');

  return result;
};

// Add a new class to an event
const addClassToEvent = async (eventId: string, newClass: { name: string; status?: 'pending' | 'live' | 'completed' }): Promise<IEvent> => {
  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  // check if class name already exists (case-insensitive)
  const isDuplicate = event.class.some(
    (c) => c.name.trim().toLowerCase() === newClass.name.trim().toLowerCase()
  );
  if (isDuplicate) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Class '${newClass.name}' already exists in this event`);
  }

  event.class.push({
    name: newClass.name.trim(),
    status: newClass.status || 'pending',
  });

  await event.save();

  // Invalidate caches
  await RedisHelper.deleteCache(`event:detail:${eventId}`);
  await RedisHelper.deleteCachePattern('events:base:*');

  return event;
};

// Update status of a specific class in an event
const updateClassStatus = async (eventId: string, className: string, status: 'pending' | 'live' | 'completed'): Promise<IEvent> => {
  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  const classItem = event.class.find(
    (c) => c.name.trim().toLowerCase() === className.trim().toLowerCase()
  );
  if (!classItem) {
    throw new ApiError(StatusCodes.NOT_FOUND, `Class '${className}' not found in this event`);
  }

  classItem.status = status;
  await event.save();

  // Invalidate caches
  await RedisHelper.deleteCache(`event:detail:${eventId}`);
  await RedisHelper.deleteCachePattern('events:base:*');

  return event;
};

// Delete a class from an event
const deleteClassFromEvent = async (eventId: string, className: string): Promise<IEvent> => {
  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  const classIndex = event.class.findIndex(
    (c) => c.name.trim().toLowerCase() === className.trim().toLowerCase()
  );
  if (classIndex === -1) {
    throw new ApiError(StatusCodes.NOT_FOUND, `Class '${className}' not found in this event`);
  }

  // ensure at least one class remains
  if (event.class.length <= 1) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Event must have at least one class');
  }

  event.class.splice(classIndex, 1);
  await event.save();

  // Invalidate caches
  await RedisHelper.deleteCache(`event:detail:${eventId}`);
  await RedisHelper.deleteCachePattern('events:base:*');

  return event;
};

export const EventServices = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addClassToEvent,
  updateClassStatus,
  deleteClassFromEvent,
};

