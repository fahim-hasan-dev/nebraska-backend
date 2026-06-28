import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IContact, IFaq, IPublic } from './public.interface'
import { Contact, Faq, Public } from './public.model'
import { User } from '../../../app/modules/user/user.model'
import { emailHelper } from '../../../helpers/emailHelper'
import QueryBuilder from '../../builder/QueryBuilder'
import { emailTemplate } from '../../../shared/emailTemplate'
import { RedisHelper } from '../../../helpers/redis'
import { emailQueue } from '../../../helpers/queue'

const createPublic = async (payload: IPublic) => {
  const isExist = await Public.findOne({
    type: payload.type,
  })
  if (isExist) {
    await Public.findByIdAndUpdate(
      isExist._id,
      {
        $set: {
          content: payload.content,
        },
      },
      {
        new: true,
      },
    )
  } else {
    const result = await Public.create(payload)
    if (!result)
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Public')
  }

  // Invalidate cache
  await RedisHelper.deleteCache(`public:type:${payload.type}`);

  return `${payload.type} created successfully}`
}

const getAllPublics = async (
  type: 'privacy-policy' | 'terms-and-condition',
) => {
  const cacheKey = `public:type:${type}`;
  const cachedData = await RedisHelper.getCache<any>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const result = await Public.findOne({ type: type }).lean()
  const responseData = result || null;

  if (responseData) {
    await RedisHelper.setCache(cacheKey, responseData); // Cache permanently
  }

  return responseData;
}

const deletePublic = async (id: string) => {
  const result = await Public.findByIdAndDelete(id)
  if (result) {
    // Invalidate specific cache
    await RedisHelper.deleteCache(`public:type:${result.type}`);
  }
  return result
}

const createContact = async (payload: IContact) => {
  try {
    // Find admin user to send notification
    const admin = await User.findOne({ role: 'admin' })

    if (!admin || !admin.email) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Admin user not found',
      )
    }

    const result = await Contact.create(payload)
    if (!result)
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Contact')
    await emailQueue.add(
      'admin-contact-notification',
      emailTemplate.adminContactNotificationEmail(payload)
    );
    await emailQueue.add(
      'user-contact-confirmation',
      emailTemplate.userContactConfirmationEmail(payload)
    );

    return {
      message: 'Contact form submitted successfully',
    }
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to submit contact form',
    )
  }
}

const getAllContacts = async (query: Record<string, unknown>) => {
  const contactQueryBuilder = new QueryBuilder(Contact.find(), query)

  contactQueryBuilder.paginate()

  const result = await contactQueryBuilder.modelQuery.lean()

  // Get pagination info separately
  const paginationResult = await contactQueryBuilder.getPaginationInfo()

  // Return clean objects without circular references
  return {
    meta: paginationResult,
    result,
  }
}

const createFaq = async (payload: IFaq) => {
  const result = await Faq.create(payload)
  if (!result)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Faq')

  // Invalidate FAQ lists
  await RedisHelper.deleteCachePattern('faqs:all:*');

  return result
}

const getAllFaqs = async (query: Record<string, unknown>) => {
  const type = query.type || 'all';
  const cacheKey = `faqs:all:${type}`;
  const cachedData = await RedisHelper.getCache<any>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const filter: Record<string, any> = {}
  if (query.type) {
    filter.type = query.type
  }
  const result = await Faq.find(filter)
  const responseData = result || [];

  await RedisHelper.setCache(cacheKey, responseData); // Cache permanently

  return responseData;
}

const getSingleFaq = async (id: string) => {
  const cacheKey = `faq:detail:${id}`;
  const cachedData = await RedisHelper.getCache<any>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const result = await Faq.findById(id)
  const responseData = result || null;

  if (responseData) {
    await RedisHelper.setCache(cacheKey, responseData); // Cache permanently
  }

  return responseData;
}

const updateFaq = async (id: string, payload: Partial<IFaq>) => {
  const isExist = await Faq.findById(id)
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Faq not found')
  }
  const result = await Faq.findByIdAndUpdate(
    id,
    { $set: payload },
    {
      new: true,
    },
  )

  // Invalidate cache
  await RedisHelper.deleteCache(`faq:detail:${id}`);
  await RedisHelper.deleteCachePattern('faqs:all:*');

  return result
}

const deleteFaq = async (id: string) => {
  const isExist = await Faq.findById(id)
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Faq not found')
  }
  const result = await Faq.findByIdAndDelete(id)

  // Invalidate cache
  await RedisHelper.deleteCache(`faq:detail:${id}`);
  await RedisHelper.deleteCachePattern('faqs:all:*');

  return result
}

const updateRolebook = async (fileUrl: string) => {
  const type = 'rolebook';
  const isExist = await Public.findOne({ type });
  let result;
  
  if (isExist) {
    result = await Public.findByIdAndUpdate(
      isExist._id,
      { $set: { content: fileUrl } },
      { new: true }
    );
  } else {
    result = await Public.create({ type, content: fileUrl });
  }

  // Invalidate rolebook cache
  await RedisHelper.deleteCache('public:rolebook');

  return result;
}

const getRolebook = async () => {
  const cacheKey = 'public:rolebook';
  const cachedData = await RedisHelper.getCache<any>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const result = await Public.findOne({ type: 'rolebook' }).lean();
  const responseData = result || null;

  if (responseData) {
    await RedisHelper.setCache(cacheKey, responseData); // Cache permanently
  }

  return responseData;
}

const updateLogo = async (fileUrl: string) => {
  const type = 'logo';
  const isExist = await Public.findOne({ type });
  let result;
  
  if (isExist) {
    result = await Public.findByIdAndUpdate(
      isExist._id,
      { $set: { content: fileUrl } },
      { new: true }
    );
  } else {
    result = await Public.create({ type, content: fileUrl });
  }

  // Invalidate logo cache
  await RedisHelper.deleteCache('public:logo');

  return result;
}

const getLogo = async () => {
  const cacheKey = 'public:logo';
  const cachedData = await RedisHelper.getCache<any>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const result = await Public.findOne({ type: 'logo' }).lean();
  const responseData = result || null;

  if (responseData) {
    await RedisHelper.setCache(cacheKey, responseData); // Cache permanently
  }

  return responseData;
}

export const PublicServices = {
  createPublic,
  getAllPublics,
  deletePublic,
  createContact,
  createFaq,
  getAllFaqs,
  getSingleFaq,
  updateFaq,
  deleteFaq,
  getAllContacts,
  updateRolebook,
  getRolebook,
  updateLogo,
  getLogo,
}

