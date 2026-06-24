import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enum/user';
import { ISponsor } from './sponsor.interface';
import { SponsorModel } from './sponsor.model';
import { RedisHelper } from '../../../helpers/redis';

// Create a new sponsor
const createSponsor = async (payload: ISponsor): Promise<ISponsor> => {
  const result = await SponsorModel.create(payload);
  
  // Invalidate all cached sponsor lists
  await RedisHelper.deleteCachePattern('sponsors:all:*');
  
  return result;
};

// Retrieve all sponsors with QueryBuilder
const getAllSponsors = async (query: Record<string, unknown>, user?: any) => {
  if (user && user.role !== USER_ROLES.ADMIN) {
    query.isActive = true;
  }

  const cacheKey = RedisHelper.generateQueryKey('sponsors:all', query);
  const cachedData = await RedisHelper.getCache<any>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const sponsorQueryBuilder = new QueryBuilder(SponsorModel.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const sponsors = await sponsorQueryBuilder.modelQuery.lean();
  const paginationInfo = await sponsorQueryBuilder.getPaginationInfo();

  const result = {
    data: sponsors,
    meta: paginationInfo,
  };

  // Cache list for 24 hours (86400 seconds)
  await RedisHelper.setCache(cacheKey, result, 86400);

  return result;
};

// Get a single sponsor details by ID
const getSponsorById = async (id: string): Promise<ISponsor> => {
  const cacheKey = `sponsor:detail:${id}`;
  const cachedData = await RedisHelper.getCache<ISponsor>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const result = await SponsorModel.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sponsor not found');
  }

  // Cache detail for 24 hours (86400 seconds)
  await RedisHelper.setCache(cacheKey, result, 86400);

  return result;
};

// Update an existing sponsor details
const updateSponsor = async (id: string, payload: Partial<ISponsor>): Promise<ISponsor> => {
  const sponsor = await SponsorModel.findById(id);
  if (!sponsor) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sponsor not found');
  }

  Object.assign(sponsor, payload);
  await sponsor.save();

  // Invalidate cache
  await RedisHelper.deleteCache(`sponsor:detail:${id}`);
  await RedisHelper.deleteCachePattern('sponsors:all:*');

  return sponsor;
};

// Delete a sponsor details
const deleteSponsor = async (id: string): Promise<ISponsor> => {
  const sponsor = await SponsorModel.findById(id);
  if (!sponsor) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sponsor not found');
  }

  const result = await SponsorModel.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete sponsor');
  }

  // Invalidate cache
  await RedisHelper.deleteCache(`sponsor:detail:${id}`);
  await RedisHelper.deleteCachePattern('sponsors:all:*');

  return result;
};

export const SponsorServices = {
  createSponsor,
  getAllSponsors,
  getSponsorById,
  updateSponsor,
  deleteSponsor,
};

