"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = require("../../../enum/user");
const processReqBody_1 = require("../../middleware/processReqBody");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const user_validation_1 = require("./user.validation");
const router = express_1.default.Router();
router.get('/me', (0, auth_1.default)(user_1.USER_ROLES.FAN, user_1.USER_ROLES.DRIVER, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.getProfile);
router.get('/', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), user_controller_1.UserController.getAllUser);
router.patch('/profile', (0, processReqBody_1.fileAndBodyProcessorUsingDiskStorage)(), (0, auth_1.default)(user_1.USER_ROLES.FAN, user_1.USER_ROLES.DRIVER, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.updateProfile);
router.post('/create-driver', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), (0, validateRequest_1.default)(user_validation_1.UserValidations.createDriverSchema), user_controller_1.UserController.createDriver);
// delete my account
router.delete('/me', (0, auth_1.default)(user_1.USER_ROLES.FAN, user_1.USER_ROLES.DRIVER, user_1.USER_ROLES.ADMIN), user_controller_1.UserController.deleteMyAccount);
// get single user
router.get('/:id', user_controller_1.UserController.getSingleUser);
// delete user
router.delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), user_controller_1.UserController.deleteUser);
exports.UserRoutes = router;
