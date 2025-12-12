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
      
        await EmailService.sendMail({
            email: user.email,
            subject: "Activate Your Admin Account",
            template: "activation-mail.ejs",
            data,
        });

        res.status(201).json({
            success: true,
            message: `Please check your email (${user.email}) to activate your account!`,
            activationToken: token,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const activateUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activation_token, activation_code } = req.body;
        const newUser: { user: any; activationCode: string } = jwt.verify(
            activation_token, process.env.ACTIVATION_SECRET as string
        ) as any;

        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler("Invalid activation code", 400));
        }

        const { name, email, password } = newUser.user;
        const existUser = await UserModel.findOne({ email });
        if (existUser) { return next(new ErrorHandler("Email already exists", 400)); }

        await UserModel.create({ name, email, password, role: UserRole.ADMIN });
        res.status(201).json({ success: true, message: "Account activated successfully." });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const login = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, username } = req.body;

        // Determine if this is an admin or student login based on the endpoint path
        const isStudentLogin = req.path.includes('student');

        if ((!email && !username) || !password) {
            return next(new ErrorHandler("Please provide credentials", 400));
        }
        
        const user = email 
            ? await UserModel.findOne({ email }).select("+password")
            : await UserModel.findOne({ username }).select("+password");

        if (!user) { return next(new ErrorHandler("Invalid credentials", 400)); }

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) { 
            return next(new ErrorHandler("Invalid credentials", 400)); 
        }
        
        if (isStudentLogin) {
            // If the request came to /student-login...
            if (user.role !== UserRole.STUDENT) {
                // ...but the user is NOT a student, it's an error.
                return next(new ErrorHandler("Invalid credentials for this login portal", 400));
            }
            // If the user IS a student, proceed with OTP logic.
            const loginOtp = Math.floor(1000 + Math.random() * 9000).toString();
            await redis.set(`login_otp:${user._id}`, loginOtp, "EX", 300);
            await EmailService.sendMail({
              email: user.email, subject: "Your Login OTP", template: "login-otp-mail.ejs",
              data: { user: { name: user.name }, loginOtp },
            });
            return res.status(200).json({ success: true, message: `An OTP sent to ${user.email}`, user: { _id: user._id } }); // Return user ID correctly

        } else {
            // If the request came to /admin-login...
            if (user.role !== UserRole.ADMIN) {
                // ...but the user is NOT an admin, it's an error.
                return next(new ErrorHandler("You are not authorized to access this resource", 403));
            }
            // If the user IS an admin, log them in directly.
            sendToken(user, 200, res);
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const verifyOtp = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, otp } = req.body;
        const storedOtp = await redis.get(`login_otp:${userId}`);
        if (!storedOtp || storedOtp !== otp) { return next(new ErrorHandler("Invalid or expired OTP.", 400)); }

        const user = await UserModel.findById(userId);
        if (!user) { return next(new ErrorHandler("User not found.", 404)); }

        await redis.del(`login_otp:${userId}`);
        sendToken(user, 200, res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
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