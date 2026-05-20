import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { ISponsor } from './sponsor.interface';
import { SponsorModel } from './sponsor.model';

// Create a new sponsor
const createSponsor = async (payload: ISponsor): Promise<ISponsor> => {
  const result = await SponsorModel.create(payload);
  return result;
};

// Retrieve all sponsors with QueryBuilder
const getAllSponsors = async (query: Record<string, unknown>) => {
  const sponsorQueryBuilder = new QueryBuilder(SponsorModel.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const sponsors = await sponsorQueryBuilder.modelQuery.lean();
  const paginationInfo = await sponsorQueryBuilder.getPaginationInfo();

  return {
    data: sponsors,
    meta: paginationInfo,
  };
};

// Get a single sponsor details by ID
const getSponsorById = async (id: string): Promise<ISponsor> => {
  const result = await SponsorModel.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sponsor not found');
  }
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
  return result;
};

export const SponsorServices = {
  createSponsor,
  getAllSponsors,
  getSponsorById,
  updateSponsor,
  deleteSponsor,
};
