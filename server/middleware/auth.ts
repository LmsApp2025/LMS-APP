import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import * as userController from "../controllers/user.controller";
import AdminModel from "../models/admin.model";  
import StudentModel from "../models/student.model"; 

export const isAutheticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // THE FIX: Check cookies first, then fall back to headers for mobile app compatibility.
    const access_token = req.cookies.access_token || (req.headers['access-token'] as string);

    if (!access_token) {
      return next(new ErrorHandler("Please login to access this resource", 401));
    }

    const decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload;

    if (!decoded || !decoded.id) {
      return next(new ErrorHandler("Access token is not valid", 401));
    }
    
    const session = await redis.get(decoded.id);

    if (!session) {
      return next(new ErrorHandler("Session not found, please login again.", 401));
    }
    
    // This logic remains correct: always fetch the fresh user from the database.
    let user;
    if (decoded.role === 'admin') {
        user = await AdminModel.findById(decoded.id);
    } else {
        user = await StudentModel.findById(decoded.id).populate("courses");
    }

    if (!user) {
        return next(new ErrorHandler("User not found, please login again.", 401));
    }
    
    req.user = user;
    next();
  }
);

// validate user role
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

