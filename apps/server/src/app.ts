require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import { rateLimit } from "express-rate-limit";

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

// --- MIDDLEWARE ---
app.set('trust proxy', 1);
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = (process.env.ORIGIN || "['http://localhost:3000']").replace(/'/g, '"');
let parsedOrigins: string[];
try {
    parsedOrigins = JSON.parse(allowedOrigins);
} catch (e) {
    console.error("CRITICAL: Invalid ORIGIN env variable. Using fallback.", e);
    parsedOrigins = ['http://localhost:3000'];
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || parsedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);


// --- API ROUTES ---
// FIXED: Removed the "/api/v1" prefix from all routes here.
// The prefix is now handled exclusively in the main server.ts file.
app.use(userRouter);
app.use(orderRouter);
app.use(bannerRouter);
app.use(courseRouter);
app.use(notificationRouter);
app.use(analyticsRouter);
app.use(layoutRouter);
app.use(submissionRouter);


// --- HEALTH CHECK AND ERROR HANDLING ---
// This test route will now be accessible at /api/v1/test
app.get("/test", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "API is working" });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);