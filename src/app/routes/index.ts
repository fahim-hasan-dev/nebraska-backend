import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { PublicRoutes } from '../modules/public/public.route';
import { TokenRoutes } from '../modules/token/token.route';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { EventRoutes } from '../modules/event/event.route';
import { EventRegistrationRoutes } from '../modules/eventRegistration/eventRegistration.route';
import { ResultRoutes } from '../modules/result/result.route';
import { SponsorRoutes } from '../modules/sponsor/sponsor.route';
import { SponsorRequestRoutes } from '../modules/sponsorRequest/sponsorRequest.route';
import { HelpSupportRoutes } from '../modules/helpSupport/helpSupport.route';
import { MessageRoutes } from '../modules/message/message.route';


const router = express.Router();

const apiRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: "/category", route: CategoryRoutes },
    { path: "/public", route: PublicRoutes },
    { path: "/token", route: TokenRoutes },
    { path: "/notification", route: NotificationRoutes },
    { path: "/event", route: EventRoutes },
    { path: "/event-registration", route: EventRegistrationRoutes },
    { path: "/result", route: ResultRoutes },
    { path: "/sponsor", route: SponsorRoutes },
    { path: "/sponsor-request", route: SponsorRequestRoutes },
    { path: "/help-support", route: HelpSupportRoutes },
    { path: "/message", route: MessageRoutes },
]

apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;
