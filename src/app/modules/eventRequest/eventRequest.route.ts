import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { EventRequestController } from './eventRequest.controller';
import { EventRequestValidations } from './eventRequest.validation';

const router = express.Router();

// Submit class request
router.post(
  '/submit',
  auth(USER_ROLES.DRIVER),
  validateRequest(EventRequestValidations.createEventRequestZodSchema),
  EventRequestController.createEventRequest
);

// Get requests (driver gets their own, admin gets all)
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.DRIVER),
  EventRequestController.getAllEventRequests
);

// Get single request detail
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.DRIVER),
  EventRequestController.getEventRequestById
);

// Admin updates status (accept/decline)
router.patch(
  '/:id/status',
  auth(USER_ROLES.ADMIN),
  validateRequest(EventRequestValidations.updateEventRequestStatusZodSchema),
  EventRequestController.updateEventRequestStatus
);

// Withdraw/delete request
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.DRIVER),
  EventRequestController.deleteEventRequest
);

export const EventRequestRoutes = router;
