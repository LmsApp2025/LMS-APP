// In: apps/server/src/app.ts (FINAL CORRECTED VERSION)

require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import { rateLimit } from "express-rate-limit";
import path from "path";
import next from 'next';

// Import all routers
import userRouter from "./routes/user.route";
import orderRouter from "./routes/order.route";
import bannerRouter from "./routes/banner.route"; 
import courseRouter from "./routes/course.route";
import notificationRouter from "./routes/notification.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";
import submissionRouter from "./routes/submission.route";

export const app = express();

// --- NEXT.JS INTEGRATION ---
const dev = process.env.NODE_ENV !== 'production';
const adminAppPath = dev ? path.join(__dirname, '../../admin') : path.resolve(process.cwd(), 'apps/admin');
const nextApp = next({ dev, dir: adminAppPath });
export const handle = nextApp.getRequestHandler();

// Prepare Next.js before we do anything else
nextApp.prepare();

// --- MIDDLEWARE ---
app.set('trust proxy', 1);
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = (process.env.ORIGIN || "['http://localhost:3000']").replace(/'/g, '"');
let parsedOrigins: string[];
try { parsedOrigins = JSON.parse(allowedOrigins); } catch (e) { parsedOrigins = ['http://localhost:3000']; }

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || parsedOrigins.includes(origin)) { callback(null, true); } 
        else { callback(new Error('Not allowed by CORS')); }
    },
    credentials: true,
}));

// Rate Limiter
app.use("/api/v1/", rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, standardHeaders: true, legacyHeaders: false }));

// --- API ROUTES ---
// All API routes are now definitively prefixed with /api/v1
const apiRouter = express.Router();
apiRouter.use(userRouter);
apiRouter.use(orderRouter);
apiRouter.use(bannerRouter);
apiRouter.use(courseRouter);
apiRouter.use(notificationRouter);
apiRouter.use(analyticsRouter);
apiRouter.use(layoutRouter);
apiRouter.use(submissionRouter);
apiRouter.get("/test", (req, res) => res.status(200).json({ success: true, message: "API is working" }));

// Mount the API router at /api/v1
app.use('/api/v1', apiRouter);

// --- NEXT.JS & ERROR HANDLING (Must be last) ---
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    // If the route is not an API route, let Next.js handle it.
    // Otherwise, it's a 404 for the API.
    if (req.path.startsWith('/api/v1')) {
        const err = new Error(`API Route ${req.originalUrl} not found`) as any;
        err.statusCode = 404;
        return next(err);
    }
    return handle(req, res);
});

app.use(ErrorMiddleware);