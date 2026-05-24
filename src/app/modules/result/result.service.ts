import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IResult } from './result.interface';
import { ResultModel } from './result.model';
import { EventModel } from '../event/event.model';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enum/user';

// Record a new driver pull result
const createResult = async (payload: IResult): Promise<IResult> => {
  const event = await EventModel.findById(payload.event);
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  // check if class exists in event classes
  const classExists = event.class.some((c) => c.name === payload.class);
  if (!classExists) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Class '${payload.class}' not found in event`);
  }

  const driver = await User.findById(payload.driver);
  if (!driver) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Driver not found');
  }
  if (driver.role !== USER_ROLES.DRIVER) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Specified user is not a driver');
  }

  // Check if a result already exists for this driver in this specific event class
  const isExistResult = await ResultModel.findOne({
    event: payload.event,
    class: payload.class,
    driver: payload.driver,
  });
  if (isExistResult) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'A result has already been recorded for this driver in this event class'
    );
  }

  const result = await ResultModel.create(payload);
  return result;
};

// Retrieve all results with QueryBuilder support
const getAllResults = async (query: Record<string, unknown>) => {
  const resultQueryBuilder = new QueryBuilder(ResultModel.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields()
    .populate([
      { path: 'event', select: 'name date venue' },
      { path: 'driver', select: 'fullName vehicleName image' }
    ]);

  const results = await resultQueryBuilder.modelQuery.lean();
  const paginationInfo = await resultQueryBuilder.getPaginationInfo();

  return {
    data: results,
    meta: paginationInfo,
  };
};

// Retrieve single result detail by ID
const getResultById = async (id: string): Promise<IResult> => {
  const result = await ResultModel.findById(id).populate(['event', 'driver']);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Result not found');
  }
  return result;
};

// Update an existing result
const updateResult = async (id: string, payload: Partial<IResult>): Promise<IResult> => {
  const result = await ResultModel.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Result not found');
  }

  // validation when event/class are updated
  const eventId = payload.event || result.event;
  const className = payload.class || result.class;
  const driverId = payload.driver || result.driver;

  // Check if updating results in a duplicate event, class, and driver combination
  if (payload.event || payload.class || payload.driver) {
    const isExistDuplicate = await ResultModel.findOne({
      _id: { $ne: id },
      event: eventId,
      class: className,
      driver: driverId,
    });
    if (isExistDuplicate) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'A result has already been recorded for this driver in this event class'
      );
    }
  }

  if (payload.event || payload.class) {
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
    }
    const classExists = event.class.some((c) => c.name === className);
    if (!classExists) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Class '${className}' not found in event`);
    }
  }

  // validation when driver is updated
  if (payload.driver) {
    const driver = await User.findById(payload.driver);
    if (!driver) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Driver not found');
    }
    if (driver.role !== USER_ROLES.DRIVER) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Specified user is not a driver');
    }
  }

  Object.assign(result, payload);
  await result.save();
  return result;
};

// Delete a result entry
const deleteResult = async (id: string): Promise<IResult> => {
  const result = await ResultModel.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Result not found');
  }

  const deletedResult = await ResultModel.findByIdAndDelete(id);
  if (!deletedResult) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete result');
  }
  return deletedResult;
};

export const ResultServices = {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
};
