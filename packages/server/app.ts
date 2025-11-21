require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
const app = express();
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

// ==========================================================
// THE DEFINITIVE MIDDLEWARE ORDER
// ==========================================================

// 1. Trust Proxy Header (from Railway/Vercel)
// This must come first.
app.set('trust proxy', 1);

// 2. Core Middleware
app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());

let allowedOrigins: string[] = [];
try {
    const originEnv = process.env.ORIGIN || "['http://localhost:3000']";
    // This will safely parse the string format ['url1','url2'] into a real array
    allowedOrigins = JSON.parse(originEnv.replace(/'/g, '"'));
    console.log("CORS_ORIGIN configured for:", allowedOrigins);
} catch (e) {
    console.error("CRITICAL: Invalid ORIGIN environment variable format. Please use ['url1','url2'] format.", e);
    // Fallback to a safe default if parsing fails
    allowedOrigins = ['http://localhost:3000'];
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

// 4. Rate Limiter (comes after CORS and parsers)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Limit each IP to 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => req.method === 'OPTIONS',
});
app.use(limiter);

// 5. API Routers

app.use("/", userRouter);
app.use("/", orderRouter);
app.use("/", bannerRouter);
app.use("/", courseRouter);
app.use("/", notificationRouter);
app.use("/", analyticsRouter);
app.use("/", layoutRouter);
app.use("/", submissionRouter);

// 6. Test Route (for health checks)
app.get("/test", (req, res) => {
  res.status(200).json({ success: true, message: "API is working" });
});

// 7. 404 Not Found Handler (catches anything that wasn't matched above)
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// 8. Global Error Middleware (MUST be the absolute last 'app.use' call)
app.use(ErrorMiddleware);
export { app };
