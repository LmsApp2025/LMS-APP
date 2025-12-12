// In: apps/server/src/controllers/auth.controller.ts (FINAL GUARANTEED FIX)

require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import UserModel, { UserRole } from "../models/user.model";
import { createActivationToken, sendToken } from "../utils/jwt";
import * as EmailService from "../services/email.service";
import { redis } from "../utils/redis";
import jwt, { JwtPayload } from "jsonwebtoken";

// --- CONTROLLER FOR PUBLIC AUTHENTICATION ACTIONS ---

export const registration = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        const isEmailExist = await UserModel.findOne({ email });
        if (isEmailExist) { return next(new ErrorHandler("Email already exists", 400)); }

        const user = { name, email, password };
        const { token, activationCode } = createActivationToken(user);
        const data = { user: { name: user.name }, activationCode };
      
        await EmailService.sendMail({ email: user.email, subject: "Activate Your Admin Account", template: "activation-mail.ejs", data });

        res.status(201).json({ success: true, message: `Please check your email (${user.email}) to activate your account!`, activationToken: token });
    } catch (error: any) { return next(new ErrorHandler(error.message, 400)); }
});

export const activateUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activation_token, activation_code } = req.body;
        const newUser: { user: any; activationCode: string } = jwt.verify(activation_token, process.env.ACTIVATION_SECRET as string) as any;

        if (newUser.activationCode !== activation_code) { return next(new ErrorHandler("Invalid activation code", 400)); }

        const { name, email, password } = newUser.user;
        const existUser = await UserModel.findOne({ email });
        if (existUser) { return next(new ErrorHandler("Email already exists", 400)); }

        await UserModel.create({ name, email, password, role: UserRole.ADMIN });
        res.status(201).json({ success: true, message: "Account activated successfully." });
    } catch (error: any) { return next(new ErrorHandler(error.message, 400)); }
});

// --- Unified Login Controller ---
export const login = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, username } = req.body;
    const isStudentLogin = req.path.includes('student');

    if ((!email && !username) || !password) { return next(new ErrorHandler("Please provide credentials", 400)); }
    
    const user = await UserModel.findOne( email ? { email } : { username }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
        return next(new ErrorHandler("Invalid credentials", 400));
    }

    if (isStudentLogin) {
        if (user.role !== UserRole.STUDENT) { return next(new ErrorHandler("Invalid credentials for this portal", 400)); }
        
        const loginOtp = Math.floor(1000 + Math.random() * 9000).toString();
        await redis.set(`login_otp:${user._id}`, loginOtp, "EX", 300);
        await EmailService.sendMail({ email: user.email, subject: "Your Login OTP", template: "login-otp-mail.ejs", data: { user: { name: user.name }, loginOtp } });
        
        // This response is correct for the mobile app's first step.
        return res.status(200).json({ success: true, message: `An OTP sent to ${user.email}`, userId: user._id });
    } else {
        if (user.role !== UserRole.ADMIN) { return next(new ErrorHandler("Not authorized", 403)); }
        // Admin login is direct.
        sendToken(user, 200, res);
    }
});

// --- OTP Verification ---
export const verifyOtp = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) { return next(new ErrorHandler("Missing userId or otp", 400)); }

    const storedOtp = await redis.get(`login_otp:${userId}`);
    if (!storedOtp || storedOtp !== otp) {
        return next(new ErrorHandler("Invalid or expired OTP.", 400));
    }

    // THE CORE FIX: Fetch the full user from the database ONCE after successful verification.
    const user = await UserModel.findById(userId);
    if (!user) { return next(new ErrorHandler("User not found.", 404)); }

    // Clean up the OTP from Redis
    await redis.del(`login_otp:${userId}`);

    // Call sendToken, which handles saving the full user to Redis and sending tokens.
    sendToken(user, 200, res);
});


export const logout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });
        redis.del(req.user?._id as string);
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const refreshToken = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token || req.headers['refresh-token'];
      if (!refresh_token) { return next(new ErrorHandler("Please login", 400)); }

      const decoded = jwt.verify(refresh_token as string, process.env.REFRESH_TOKEN!) as JwtPayload;
      if (!decoded || !decoded.id) { return next(new ErrorHandler("Could not refresh token", 400)); }

      const session = await redis.get(decoded.id);
      if (!session) { return next(new ErrorHandler("Session expired", 400)); }

      const user = await UserModel.findById(decoded.id).populate("courses");
      if (!user) { return next(new ErrorHandler("User not found", 400)); }
      
      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
});