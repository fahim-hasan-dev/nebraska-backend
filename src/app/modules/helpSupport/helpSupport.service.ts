import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IHelpSupport } from './helpSupport.interface';
import { HelpSupportModel } from './helpSupport.model';
import { User } from '../user/user.model';
import { NotificationService } from '../notification/notification.service';

// Create a new support ticket
const createHelpSupport = async (payload: IHelpSupport, userName: string): Promise<IHelpSupport> => {
  const result = await HelpSupportModel.create(payload);

  // Notify admin when a new support ticket is submitted
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await NotificationService.insertNotification({
        title: 'New Support Ticket Submitted',
        message: `A new support ticket "${payload.title}" has been submitted by ${userName}.`,
        receiver: admin._id,
        read: false,
        referenceId: result._id,
        screen: 'HELP_SUPPORT',
        type: 'ADMIN',
      });
    }
  } catch (error) {
    console.error('Failed to dispatch support ticket creation notification:', error);
  }

  return result;
};

// Retrieve all support tickets with custom pagination, searching, and status sorting
const getAllHelpSupports = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 15;
  const skip = (page - 1) * limit;

  const matchStage: Record<string, any> = {};

  // Handle scoping to a specific user
  if (query.user) {
    matchStage.user = new Types.ObjectId(query.user as string);
  }

  // Handle searching by user fullName, email, or ticket title/description
  if (query.searchTerm) {
    const searchTerm = query.searchTerm as string;
    const matchingUsers = await User.find({
      $or: [
        { fullName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    }).select('_id');
    const userIds = matchingUsers.map(u => u._id);

    matchStage.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { user: { $in: userIds } }
    ];
  }

  // Handle other filters from query (excluding pagination, search, sort, and user)
  const excludeFields = ['searchTerm', 'sort', 'page', 'limit', 'fields', 'user'];
  const filters = { ...query };
  excludeFields.forEach(el => delete filters[el]);

  const cleanedFilters = cleanObject(filters);
  Object.assign(matchStage, cleanedFilters);

  // Aggregation pipeline
  const pipeline: any[] = [
    { $match: matchStage },
    // Add custom status weight: pending = 1, resolved = 2, rejected = 3
    {
      $addFields: {
        statusWeight: {
          $switch: {
            branches: [
              { case: { $eq: ['$status', 'pending'] }, then: 1 },
              { case: { $eq: ['$status', 'resolved'] }, then: 2 },
              { case: { $eq: ['$status', 'rejected'] }, then: 3 }
            ],
            default: 4
          }
        }
      }
    },
    // Sort by statusWeight ascending, then by createdAt descending
    { $sort: { statusWeight: 1, createdAt: -1 } }
  ];

  // Count total matches for pagination (before skip and limit)
  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await HelpSupportModel.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Add pagination limits and user population lookup
  pipeline.push(
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        file: 1,
        status: 1,
        reply: 1,
        createdAt: 1,
        updatedAt: 1,
        'user._id': 1,
        'user.fullName': 1,
        'user.email': 1,
        'user.phone': 1,
        'user.image': 1,
        'user.vehicleName': 1,
        'user.role': 1
      }
    }
  );

  const tickets = await HelpSupportModel.aggregate(pipeline);
  const totalPage = Math.ceil(total / limit);

  return {
    data: tickets,
    meta: {
      total,
      limit,
      page,
      totalPage
    }
  };
};

// Helper function to remove empty/undefined filters
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
      !(
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0
      )
    ) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Get a single support ticket by ID
const getHelpSupportById = async (id: string): Promise<IHelpSupport> => {
  const result = await HelpSupportModel.findById(id).populate(['user'], {
    user: 'fullName email phone image vehicleName role',
  });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Support ticket not found');
  }
  return result;
};

// Update support ticket status (Admin only)
const updateHelpSupportStatus = async (
  id: string,
  status: 'pending' | 'resolved' | 'rejected',
  reply: string
): Promise<IHelpSupport> => {
  const ticket = await HelpSupportModel.findById(id);
  if (!ticket) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Support ticket not found');
  }

  ticket.status = status;
  ticket.reply = reply;
  await ticket.save();

  // Notify the user who created the support ticket that it has been resolved/rejected
  try {
    if (status === 'resolved' || status === 'rejected') {
      const isResolved = status === 'resolved';
      await NotificationService.insertNotification({
        title: isResolved ? 'Support Ticket Resolved' : 'Support Ticket Rejected',
        message: `Your support ticket "${ticket.title}" has been ${status}. Reply: "${reply}"`,
        receiver: ticket.user,
        read: false,
        referenceId: ticket._id,
        screen: 'HELP_SUPPORT',
        type: 'USER',
      });
    }
  } catch (error) {
    console.error('Failed to dispatch support ticket resolution/rejection notification:', error);
  }

  return ticket;
};

// Delete/withdraw a support ticket
const deleteHelpSupport = async (id: string): Promise<IHelpSupport> => {
  const ticket = await HelpSupportModel.findById(id);
  if (!ticket) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Support ticket not found');
  }

  const result = await HelpSupportModel.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete support ticket');
  }
  return result;
};

export const HelpSupportServices = {
  createHelpSupport,
  getAllHelpSupports,
  getHelpSupportById,
  updateHelpSupportStatus,
  deleteHelpSupport,
};
