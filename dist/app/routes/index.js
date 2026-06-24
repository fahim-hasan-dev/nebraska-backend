"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const category_route_1 = require("../modules/category/category.route");
const public_route_1 = require("../modules/public/public.route");
const token_route_1 = require("../modules/token/token.route");
const notification_routes_1 = require("../modules/notification/notification.routes");
const event_route_1 = require("../modules/event/event.route");
const eventRegistration_route_1 = require("../modules/eventRegistration/eventRegistration.route");
const result_route_1 = require("../modules/result/result.route");
const sponsor_route_1 = require("../modules/sponsor/sponsor.route");
const sponsorRequest_route_1 = require("../modules/sponsorRequest/sponsorRequest.route");
const helpSupport_route_1 = require("../modules/helpSupport/helpSupport.route");
const message_route_1 = require("../modules/message/message.route");
const router = express_1.default.Router();
const apiRoutes = [
    { path: "/user", route: user_route_1.UserRoutes },
    { path: "/auth", route: auth_route_1.AuthRoutes },
    { path: "/category", route: category_route_1.CategoryRoutes },
    { path: "/public", route: public_route_1.PublicRoutes },
    { path: "/token", route: token_route_1.TokenRoutes },
    { path: "/notification", route: notification_routes_1.NotificationRoutes },
    { path: "/event", route: event_route_1.EventRoutes },
    { path: "/event-registration", route: eventRegistration_route_1.EventRegistrationRoutes },
    { path: "/result", route: result_route_1.ResultRoutes },
    { path: "/sponsor", route: sponsor_route_1.SponsorRoutes },
    { path: "/sponsor-request", route: sponsorRequest_route_1.SponsorRequestRoutes },
    { path: "/help-support", route: helpSupport_route_1.HelpSupportRoutes },
    { path: "/message", route: message_route_1.MessageRoutes },
];
apiRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
