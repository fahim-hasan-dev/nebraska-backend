import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IUser } from './user.interface'
import { User } from './user.model'
import { USER_ROLES, USER_STATUS } from '../../../enum/user'
import { JwtPayload } from 'jsonwebtoken'
import { logger } from '../../../shared/logger'
import QueryBuilder from '../../builder/QueryBuilder'
import config from '../../../config'
import { emailTemplate } from '../../../shared/emailTemplate'
import { emailHelper } from '../../../helpers/emailHelper'
import { RedisHelper } from '../../../helpers/redis'
import { emailQueue } from '../../../helpers/queue'


const getAllUser = async (query: Record<string, unknown>) => {
    const userQueryBuilder = new QueryBuilder(
        User.find({ role: { $nin: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] } }).select('-password -authentication'),
        query
    )
        .filter()
        .search(["fullName","email","phone"])
        .sort()
        .fields()
        .paginate()


    const users = await userQueryBuilder.modelQuery.lean()
    const paginationInfo = await userQueryBuilder.getPaginationInfo()

    const totalUsers = await User.countDocuments({ role: { $nin: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] } })
    const staticData = { totalUsers }

    return {
        users,
        staticData,
        meta: paginationInfo,
    }
}

const getAllAdmins = async (query: Record<string, unknown>) => {
    const userQueryBuilder = new QueryBuilder(
        User.find({ role: USER_ROLES.ADMIN }).select('-password -authentication'),
        query
    )
        .filter()
        .search(["fullName","email","phone"])
        .sort()
        .fields()
        .paginate()

    const admins = await userQueryBuilder.modelQuery.lean()
    const paginationInfo = await userQueryBuilder.getPaginationInfo()

    const totalAdmins = await User.countDocuments({ role: USER_ROLES.ADMIN })
    const staticData = { totalAdmins }

    return {
        admins,
        staticData,
        meta: paginationInfo,
    }
}

const getSingleUser = async (id: string) => {
    const cacheKey = `user:profile:${id}`;
    const cachedData = await RedisHelper.getCache<any>(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    const result = await User.findById(id).select('-password -authentication')
    if (result) {
        await RedisHelper.setCache(cacheKey, result, 86400); // 24 hours TTL
    }
    return result
}

// delete User
const deleteUser = async (id: string) => {
    const user = await User.findById(id)
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    const result = await User.findByIdAndDelete(id)

    // Invalidate cache
    await RedisHelper.deleteCache(`user:profile:${id}`);

    return result
}

const updateProfile = async (
    user: JwtPayload,
    payload: Partial<IUser>
) => {
    const isExistUser = await User.findById(user.authId)

    if (!isExistUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found or deleted.')
    }

    const updatedUser = await User.findOneAndUpdate(
        { _id: user.authId, status: { $ne: USER_STATUS.DELETED } },
        payload,
        { new: true },
    )

    if (!updatedUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update profile')
    }

    // Invalidate cache
    await RedisHelper.deleteCache(`user:profile:${user.authId}`);

    return updatedUser
}

const getProfile = async (user: JwtPayload) => {
    const cacheKey = `user:profile:${user.authId}`;
    const cachedData = await RedisHelper.getCache<any>(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    const isExistUser = await User.findById(user.authId).lean().select('-password -authentication')
    if (!isExistUser) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            'The requested profile not found or deleted.',
        )
    }

    await RedisHelper.setCache(cacheKey, isExistUser, 86400); 
    return isExistUser
}


const deleteMyAccount = async (user: JwtPayload) => {
    const isExistUser = await User.findById(user.authId)
    if (!isExistUser) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            'The requested profile not found or deleted.',
        )
    }

    await User.findByIdAndDelete(isExistUser._id)

    // Invalidate cache
    await RedisHelper.deleteCache(`user:profile:${user.authId}`);

    return 'Account deleted successfully'
}

const createDriver = async (payload: Partial<IUser>) => {
    const email = payload.email?.toLowerCase().trim();
    const isUserExist = await User.findOne({
        email,
        status: { $ne: USER_STATUS.DELETED },
    });

    if (isUserExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'An account with this email already exists.');
    }

    const driverData = {
        ...payload,
        role: USER_ROLES.DRIVER,
        verified: true,
    };

    const result = await User.create(driverData);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create driver account.');
    }

    // Send credentials email to driver
    const mailData = emailTemplate.driverAccountCreated({
        name: result.fullName,
        email: result.email,
        password: payload.password as string,
    });
    await emailQueue.add('driver-created', mailData);

    return result;
}

const createAdmin = async (payload: Partial<IUser>) => {
    const email = payload.email?.toLowerCase().trim();
    const isUserExist = await User.findOne({
        email,
        status: { $ne: USER_STATUS.DELETED },
    });

    if (isUserExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'An account with this email already exists.');
    }

    const adminData = {
        ...payload,
        role: USER_ROLES.ADMIN,
        verified: true,
        status: USER_STATUS.ACTIVE,
    };

    const result = await User.create(adminData);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create admin account.');
    }

    return result;
}

const updateAdminStatus = async (id: string, status: USER_STATUS) => {
    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Admin account not found');
    }
    if (user.role !== USER_ROLES.ADMIN) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Specified user is not an admin');
    }

    user.status = status;
    await user.save();

    // Invalidate profile cache
    await RedisHelper.deleteCache(`user:profile:${id}`);

    return user;
}

const deleteAdmin = async (id: string) => {
    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Admin account not found');
    }
    if (user.role !== USER_ROLES.ADMIN) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Specified user is not an admin');
    }

    const result = await User.findByIdAndDelete(id);

    // Invalidate profile cache
    await RedisHelper.deleteCache(`user:profile:${id}`);

    return result;
}

export const UserServices = {
    updateProfile,
    getAllUser,
    getAllAdmins,
    getSingleUser,
    deleteUser,
    getProfile,
    deleteMyAccount,
    createDriver,
    createAdmin,
    updateAdminStatus,
    deleteAdmin,
}

