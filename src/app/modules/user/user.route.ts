import express from 'express'
import { UserController } from './user.controller'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import fileUploadHandler from '../../middleware/fileUploadHandler'
import { fileAndBodyProcessorUsingDiskStorage } from '../../middleware/processReqBody'
import validateRequest from '../../middleware/validateRequest'
import { UserValidations } from './user.validation'

const router = express.Router()

router.get(
  '/me',
  auth(USER_ROLES.FAN, USER_ROLES.DRIVER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserController.getProfile,
)
router.get('/', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.getAllUser);
router.patch(
  '/profile',
  fileAndBodyProcessorUsingDiskStorage(),
  auth(USER_ROLES.FAN, USER_ROLES.DRIVER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserController.updateProfile,
)

router.post(
  '/create-driver',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(UserValidations.createDriverSchema),
  UserController.createDriver
)

router.post(
  '/admin',
  auth(USER_ROLES.SUPER_ADMIN),
  validateRequest(UserValidations.createAdminSchema),
  UserController.createAdmin
)

router.get(
  '/admin',
  auth(USER_ROLES.SUPER_ADMIN),
  UserController.getAllAdmins
)

router.patch(
  '/admin/:id/status',
  auth(USER_ROLES.SUPER_ADMIN),
  validateRequest(UserValidations.updateAdminStatusSchema),
  UserController.updateAdminStatus
)

router.delete(
  '/admin/:id',
  auth(USER_ROLES.SUPER_ADMIN),
  UserController.deleteAdmin
)

// delete my account
router.delete(
  '/me',
  auth(USER_ROLES.FAN, USER_ROLES.DRIVER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserController.deleteMyAccount,
)

// get single user
router.get('/:id', UserController.getSingleUser)


// delete user
router.delete('/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.deleteUser)

export const UserRoutes = router
