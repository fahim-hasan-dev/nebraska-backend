import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';
import { HelpSupportController } from './helpSupport.controller';
import { HelpSupportValidations } from './helpSupport.validation';

const router = express.Router();

// Submit a new support ticket (with optional file/image upload)
router.post(
  '/submit',
  auth( USER_ROLES.DRIVER, USER_ROLES.FAN),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(HelpSupportValidations.createHelpSupportZodSchema),
  HelpSupportController.createHelpSupport
);

// Get support tickets list (users see their own, admins see all)
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.DRIVER, USER_ROLES.FAN),
  HelpSupportController.getAllHelpSupports
);

// Get support ticket details by ID
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.DRIVER, USER_ROLES.FAN),
  HelpSupportController.getHelpSupportById
);

// Update support ticket status (Admin only, requires reply)
router.patch(
  '/:id/status',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(HelpSupportValidations.updateHelpSupportStatusZodSchema),
  HelpSupportController.updateHelpSupportStatus
);

// Delete/withdraw support ticket
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.DRIVER, USER_ROLES.FAN),
  HelpSupportController.deleteHelpSupport
);

export const HelpSupportRoutes = router;
