import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { MessageController } from './message.controller';
import { MessageValidations } from './message.validation';

const router = express.Router();

// Post a new targeted message (Admin only)
router.post(
  '/create',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(MessageValidations.createMessageZodSchema),
  MessageController.createMessage
);

// Get all messages list (Admin, Driver, Fan)
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.DRIVER, USER_ROLES.FAN),
  MessageController.getAllMessages
);

// Get message details by ID (Admin, Driver, Fan)
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.DRIVER, USER_ROLES.FAN),
  MessageController.getMessageById
);

// Update an existing message details (Admin only)
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(MessageValidations.updateMessageZodSchema),
  MessageController.updateMessage
);

// Delete a message permanently (Admin only)
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  MessageController.deleteMessage
);

export const MessageRoutes = router;
