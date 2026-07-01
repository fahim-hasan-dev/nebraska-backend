import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { ResultController } from './result.controller';
import { ResultValidations } from './result.validation';

const router = express.Router();

// Record pull result (Admin only)
router.post(
  '/create',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(ResultValidations.createResultZodSchema),
  ResultController.createResult
);

// Get results list (Admin, Driver, Fan)
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.DRIVER, USER_ROLES.FAN),
  ResultController.getAllResults
);

// Get single result details (Admin, Driver, Fan)
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.DRIVER, USER_ROLES.FAN),
  ResultController.getResultById
);

// Update a result entry (Admin only)
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(ResultValidations.updateResultZodSchema),
  ResultController.updateResult
);

// Delete a result entry (Admin only)
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ResultController.deleteResult
);

export const ResultRoutes = router;
