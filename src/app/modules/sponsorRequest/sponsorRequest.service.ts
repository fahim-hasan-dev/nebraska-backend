import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { ISponsorRequest } from './sponsorRequest.interface';
import { SponsorRequestModel } from './sponsorRequest.model';

// Create a new sponsor request inquiry
const createSponsorRequest = async (payload: ISponsorRequest): Promise<ISponsorRequest> => {
  const result = await SponsorRequestModel.create(payload);
  return result;
};

// Retrieve all sponsor request inquiries with QueryBuilder
const getAllSponsorRequests = async (query: Record<string, unknown>) => {
  const requestQueryBuilder = new QueryBuilder(SponsorRequestModel.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields()
    .populate(['user']);

  const requests = await requestQueryBuilder.modelQuery.lean();
  const paginationInfo = await requestQueryBuilder.getPaginationInfo();

  return {
    data: requests,
    meta: paginationInfo,
  };
};

// Get a single sponsor request inquiry details by ID
const getSponsorRequestById = async (id: string): Promise<ISponsorRequest> => {
  const result = await SponsorRequestModel.findById(id).populate(['user']);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sponsor request not found');
  }
  return result;
};

// Update request status (Admin only)
const updateSponsorRequestStatus = async (id: string, status: string): Promise<ISponsorRequest> => {
  const request = await SponsorRequestModel.findById(id);
  if (!request) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sponsor request not found');
  }

  request.status = status as 'pending' | 'accepted' | 'declined';
  await request.save();
  return request;
};

// Delete/withdraw a sponsor request inquiry
const deleteSponsorRequest = async (id: string): Promise<ISponsorRequest> => {
  const request = await SponsorRequestModel.findById(id);
  if (!request) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sponsor request not found');
  }

  const result = await SponsorRequestModel.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete sponsor request');
  }
  return result;
};

export const SponsorRequestServices = {
  createSponsorRequest,
  getAllSponsorRequests,
  getSponsorRequestById,
  updateSponsorRequestStatus,
  deleteSponsorRequest,
};
