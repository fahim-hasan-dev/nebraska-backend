import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { ISponsorRequest } from './sponsorRequest.interface';
import { SponsorRequestModel } from './sponsorRequest.model';
import { User } from '../user/user.model';

// Create a new sponsor request inquiry
const createSponsorRequest = async (payload: ISponsorRequest): Promise<ISponsorRequest> => {
  const result = await SponsorRequestModel.create(payload);
  return result;
};

// Retrieve all sponsor request inquiries with search, pagination, and status sorting
const getAllSponsorRequests = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 15;
  const skip = (page - 1) * limit;

  const matchStage: Record<string, any> = {};

  // Search by businessName (local), user fullName, or user email
  if (query.searchTerm) {
    const searchTerm = query.searchTerm as string;

    // Find users matching fullName or email
    const matchingUsers = await User.find({
      $or: [
        { fullName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ],
    }).select('_id');
    const userIds = matchingUsers.map((u) => u._id);

    matchStage.$or = [
      { businessName: { $regex: searchTerm, $options: 'i' } },
      { user: { $in: userIds } },
    ];
  }

  // Apply remaining filters (exclude pagination/search keys)
  const excludeFields = ['searchTerm', 'sort', 'page', 'limit', 'fields'];
  const filters = { ...query };
  excludeFields.forEach((el) => delete filters[el]);
  const cleanedFilters = cleanObject(filters);
  Object.assign(matchStage, cleanedFilters);

  // Aggregation pipeline with custom status sorting
  const pipeline: any[] = [
    { $match: matchStage },
    {
      $addFields: {
        statusWeight: {
          $switch: {
            branches: [
              { case: { $eq: ['$status', 'pending'] }, then: 1 },
              { case: { $eq: ['$status', 'accepted'] }, then: 2 },
              { case: { $eq: ['$status', 'declined'] }, then: 3 },
            ],
            default: 4,
          },
        },
      },
    },
    { $sort: { statusWeight: 1, createdAt: -1 } },
  ];

  // Count total for pagination
  const countResult = await SponsorRequestModel.aggregate([...pipeline, { $count: 'total' }]);
  const total = countResult[0]?.total || 0;

  // Apply pagination and populate user
  pipeline.push(
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        businessName: 1,
        message: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        'user._id': 1,
        'user.fullName': 1,
        'user.email': 1,
        'user.phone': 1,
        'user.image': 1,
        'user.role': 1,
      },
    },
  );

  const requests = await SponsorRequestModel.aggregate(pipeline);
  const totalPage = Math.ceil(total / limit);

  return {
    data: requests,
    meta: { total, limit, page, totalPage },
  };
};

// Helper to strip empty/undefined values from filter objects
function cleanObject(obj: Record<string, any>) {
  const cleaned: Record<string, any> = {};
  for (const key in obj) {
    const value = obj[key];
    if (
      value !== null &&
      value !== undefined &&
      value !== '' &&
      value !== 'undefined' &&
      !(Array.isArray(value) && value.length === 0) &&
      !(typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
    ) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Get a single sponsor request inquiry details by ID
const getSponsorRequestById = async (id: string): Promise<ISponsorRequest> => {
  const result = await SponsorRequestModel.findById(id).populate([
    { path: 'user', select: 'fullName email phone image role' },
  ]);
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
