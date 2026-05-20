import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { PublicRoutes } from '../modules/public/public.route';
import { TokenRoutes } from '../modules/token/token.route';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { EventRoutes } from '../modules/event/event.route';
import { EventRequestRoutes } from '../modules/eventRequest/eventRequest.route';
import { ResultRoutes } from '../modules/result/result.route';


const router = express.Router();

const apiRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: "/category", route: CategoryRoutes },
    { path: "/public", route: PublicRoutes },
    { path: "/token", route: TokenRoutes },
    { path: "/notification", route: NotificationRoutes },
    { path: "/event", route: EventRoutes },
    { path: "/event-request", route: EventRequestRoutes },
    { path: "/result", route: ResultRoutes },
]

apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;
