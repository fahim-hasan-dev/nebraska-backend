import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody';
import { SponsorController } from './sponsor.controller';
import { SponsorValidations } from './sponsor.validation';

const router = express.Router();

// Add new sponsor (Admin only)
router.post(
  '/create',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(SponsorValidations.createSponsorZodSchema),
  SponsorController.createSponsor
);

// Get sponsors list (Admin, Driver, Fan)
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.DRIVER, USER_ROLES.FAN),
  SponsorController.getAllSponsors
);

// Get sponsor details by ID (Admin, Driver, Fan)
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.DRIVER, USER_ROLES.FAN),
  SponsorController.getSponsorById
);

// Update sponsor details (Admin only)
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(SponsorValidations.updateSponsorZodSchema),
  SponsorController.updateSponsor
);

// Delete sponsor (Admin only)
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SponsorController.deleteSponsor
);

export const SponsorRoutes = router;
