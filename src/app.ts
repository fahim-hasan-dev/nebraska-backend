import express, { Request, Response } from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import { Morgan } from "./shared/morgan";
import router from './app/routes';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import requestIp from 'request-ip';
import rateLimit from 'express-rate-limit';
import ApiError from "./errors/ApiError";
import compression from "compression";
const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
        if (!req.clientIp) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Unable to determine client IP!');
        }
        return req.clientIp;
    },
    handler: (req, res, next, options) => {
        throw new ApiError(options?.statusCode, `Rate limit exceeded. Try again in ${options.windowMs / 60000} minutes.`);
    }
});


// morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);


//body parser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestIp.mw());
// app.use(limiter);

//file retrieve
app.use(express.static('uploads'));

//router
app.use('/api/v1', router);




app.get("/", (req: Request, res: Response) => {
    res.send(`<div style="background:#070913; color:#f8fafc; font-family:'Segoe UI',sans-serif; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; margin:0; text-align:center; padding: 20px; box-sizing: border-box;">
  <h1 style="color:#5690ff; margin:0 0 8px 0; font-weight:600; font-size:28px;">Nebraska Bush Puller</h1>
  <p style="color:#94a3b8; font-size:16px; margin:0;">API Gateway is online and active.</p>
</div>`);
});

//global error handle
app.use(globalErrorHandler);

// handle not found route
app.use((req: Request, res: Response) => {
    res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Not Found",
        errorMessages: [
            {
                path: req.originalUrl,
                message: "API DOESN'T EXIST"
            }
        ]
    })
});

export default app;
