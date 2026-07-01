import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';
import { NotificationController } from './notification.controller';
const router = express.Router();

router.get('/',
    auth(USER_ROLES.FAN, USER_ROLES.DRIVER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NotificationController.getNotificationFromDB
);

router.get('/unread-count',
    auth(USER_ROLES.FAN, USER_ROLES.DRIVER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NotificationController.getUnreadCount
);

router.post('/test-push', NotificationController.sendTestPushNotification);

export const NotificationRoutes = router;
