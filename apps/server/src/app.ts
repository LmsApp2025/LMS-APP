// In: apps/server/src/app.ts (FINAL, PURE API VERSION)

require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import { rateLimit } from "express-rate-limit";

// Import all API routers
import userRouter from "./routes/user.route";
import orderRouter from "./routes/order.route";
import bannerRouter from "./routes/banner.route";
import courseRouter from "./routes/course.route";
import notificationRouter from "./routes/notification.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";
import submissionRouter from "./routes/submission.route";

export const app = express();

// --- CORE MIDDLEWARE ---
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

// --- API ROUTES ---
// Mount all API routers under the /api/v1 prefix
app.use("/api/v1", userRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", bannerRouter);
app.use("/api/v1", courseRouter);
app.use("/api/v1", notificationRouter);
app.use("/api/v1", analyticsRouter);
app.use("/api/v1", layoutRouter);
app.use("/api/v1", submissionRouter);

// --- HEALTH CHECK AND ERROR HANDLING ---
app.get("/api/v1/test", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server API is working" });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);