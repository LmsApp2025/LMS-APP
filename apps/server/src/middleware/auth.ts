import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";

export const isAutheticated = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token || (req.headers['access-token'] as string);
    if (!access_token) { return next(new ErrorHandler("Please login to access this resource", 401)); }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload;
    if (!decoded || !decoded.id) { return next(new ErrorHandler("Access token is not valid", 401)); }
    
    // THE DEFINITIVE FIX: Get the user object directly from Redis.
    // This is much faster and ensures we have the most up-to-date session state.
    const session = await redis.get(decoded.id);

    if (!session) { return next(new ErrorHandler("Session not found, please login again.", 401)); }
    
    // Parse the user object from the session and attach it to the request.
    req.user = JSON.parse(session);
    
    next();
});

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed`, 403));
    }
    next();
  };
};