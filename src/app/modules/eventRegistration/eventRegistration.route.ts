import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { EventRegistrationController } from './eventRegistration.controller';
import { EventRegistrationValidations } from './eventRegistration.validation';

const router = express.Router();

// Submit registration request
router.post(
  '/submit',
  auth(USER_ROLES.DRIVER),
  validateRequest(EventRegistrationValidations.createEventRegistrationZodSchema),
  EventRegistrationController.createEventRegistration
);

// Admin manually registers a driver directly with approved status (Admin only)
router.post(
  '/admin-add',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(EventRegistrationValidations.adminAddRegistrationZodSchema),
  EventRegistrationController.adminAddEventRegistration
);

// Draw pulling order positions (Admin only)
router.post(
  '/draw',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(EventRegistrationValidations.drawEventRegistrationZodSchema),
  EventRegistrationController.drawRegistrations
);

// Cancel drawing positions (Admin only)
router.post(
  '/cancel-draw',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(EventRegistrationValidations.drawEventRegistrationZodSchema),
  EventRegistrationController.cancelDrawRegistrations
);

// Get registrations (driver gets their own, admin gets all)
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.DRIVER, USER_ROLES.FAN),
  EventRegistrationController.getAllEventRegistrations
);

// Get single registration detail
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.DRIVER, USER_ROLES.FAN),
  EventRegistrationController.getEventRegistrationById
);

// Admin updates status (approve/reject)
router.patch(
  '/:id/status',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(EventRegistrationValidations.updateEventRegistrationStatusZodSchema),
  EventRegistrationController.updateEventRegistrationStatus
);

// Withdraw/delete registration
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.DRIVER),
  EventRegistrationController.deleteEventRegistration
);

export const EventRegistrationRoutes = router;
