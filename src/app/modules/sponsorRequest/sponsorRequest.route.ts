import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { SponsorRequestController } from './sponsorRequest.controller';
import { SponsorRequestValidations } from './sponsorRequest.validation';

const router = express.Router();

// Submit sponsor request inquiry
router.post(
  '/submit',
  auth( USER_ROLES.DRIVER, USER_ROLES.FAN),
  validateRequest(SponsorRequestValidations.createSponsorRequestZodSchema),
  SponsorRequestController.createSponsorRequest
);

// Get sponsor requests list
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SponsorRequestController.getAllSponsorRequests
);

// Get sponsor request details by ID
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SponsorRequestController.getSponsorRequestById
);

// Update sponsor request status (Admin only)
router.patch(
  '/:id/status',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(SponsorRequestValidations.updateSponsorRequestStatusZodSchema),
  SponsorRequestController.updateSponsorRequestStatus
);

// Delete/withdraw a sponsor request inquiry
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SponsorRequestController.deleteSponsorRequest
);

export const SponsorRequestRoutes = router;
