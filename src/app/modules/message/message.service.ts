import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enum/user';
import { IMessage } from './message.interface';
import { MessageModel } from './message.model';
import { RedisHelper } from '../../../helpers/redis';

// Create a new announcement message
const createMessage = async (payload: IMessage): Promise<IMessage> => {
  const result = await MessageModel.create(payload);
  
  // Invalidate message lists
  await RedisHelper.deleteCachePattern('messages:all:*');
  
  return result;
};

// Retrieve all messages with pagination and search, auto-scoped by role
const getAllMessages = async (query: Record<string, unknown>, user?: any) => {
  // If the user is not an admin, filter messages targeted to their specific role (driver or fan)
  if (user && user.role !== USER_ROLES.ADMIN) {
    query.userType = user.role;
  }

  const cacheKey = RedisHelper.generateQueryKey('messages:all', query);
  const cachedData = await RedisHelper.getCache<any>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const messageQueryBuilder = new QueryBuilder(MessageModel.find(), query)
    .search(['title', 'message'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const messages = await messageQueryBuilder.modelQuery.lean();
  const paginationInfo = await messageQueryBuilder.getPaginationInfo();

  const responseResult = {
    data: messages,
    meta: paginationInfo,
  };

  // Cache list for 24 hours
  await RedisHelper.setCache(cacheKey, responseResult, 86400);

  return responseResult;
};

// Get a single message details by ID with role authorization checks
const getMessageById = async (id: string, user?: any): Promise<IMessage> => {
  const cacheKey = `message:detail:${id}`;
  const cachedData = await RedisHelper.getCache<any>(cacheKey);
  if (cachedData) {
    // If a non-admin user requests the details, ensure the message is targeted at their role
    if (user && user.role !== USER_ROLES.ADMIN) {
      if (cachedData.userType !== user.role) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to view this message');
      }
    }
    return cachedData;
  }

  const result = await MessageModel.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Message not found');
  }

  // If a non-admin user requests the details, ensure the message is targeted at their role
  if (user && user.role !== USER_ROLES.ADMIN) {
    if (result.userType !== user.role) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to view this message');
    }
  }

  // Cache detail for 24 hours 
  await RedisHelper.setCache(cacheKey, result, 86400);

  return result;
};

// Update an existing message details (Admin only)
const updateMessage = async (id: string, payload: Partial<IMessage>): Promise<IMessage> => {
  const message = await MessageModel.findById(id);
  if (!message) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Message not found');
  }

  Object.assign(message, payload);
  await message.save();

  // Invalidate caches
  await RedisHelper.deleteCache(`message:detail:${id}`);
  await RedisHelper.deleteCachePattern('messages:all:*');

  return message;
};

// Delete a message (Admin only)
const deleteMessage = async (id: string): Promise<IMessage> => {
  const message = await MessageModel.findById(id);
  if (!message) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Message not found');
  }

  const result = await MessageModel.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete message');
  }

  // Invalidate caches
  await RedisHelper.deleteCache(`message:detail:${id}`);
  await RedisHelper.deleteCachePattern('messages:all:*');

  return result;
};

export const MessageServices = {
  createMessage,
  getAllMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
};

