import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';
import validateRequest from '../../middleware/validateRequest';
import { EventController } from './event.controller';
import { EventValidations } from './event.validation';

const router = express.Router();

// Admin can create a new event with multiple images uploaded in pictures field
router.post(
  '/create',
  auth(USER_ROLES.ADMIN),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(EventValidations.createEventZodSchema),
  EventController.createEvent
);

// Anyone logged in can get all events
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.FAN, USER_ROLES.DRIVER),
  EventController.getAllEvents
);

// Anyone logged in can get details of an event by ID
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.FAN, USER_ROLES.DRIVER),
  EventController.getEventById
);

// Admin can update event details and images
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(EventValidations.updateEventZodSchema),
  EventController.updateEvent
);

// Admin can delete an event
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN),
  EventController.deleteEvent
);

export const EventRoutes = router;
