import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import UserModel from "../models/user.model";
import * as UserService from "../services/user.service";
import * as FileService from "../services/file.service";
import { redis } from "../utils/redis";

// --- CONTROLLER FOR CURRENTLY LOGGED-IN USER'S ACTIONS ---

export const getUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        const user = await UserService.getUserById(userId as string);
        if (!user) { return next(new ErrorHandler("User not found", 404)); }
        res.status(200).json({ success: true, user });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const updateAvatar = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { avatar } = req.body; // base64 string
        const userId = req.user?._id as string;
        const user = await UserModel.findById(userId);

        if (!user) { return next(new ErrorHandler("User not found", 404)); }

        if (user.avatar?.public_id) {
            await FileService.removeFileFromR2('marstech-lms-avatars-2025', user.avatar.public_id);
        }

        if (avatar) {
            const uploaded = await FileService.uploadBase64ToR2(avatar, 'marstech-lms-avatars-2025', `user_${userId}`);
            user.avatar = { public_id: uploaded.public_id, url: uploaded.url };
        } else {
            user.avatar = undefined;
        }
        
        await user.save();
        await redis.set(user._id.toString(), JSON.stringify(user));
        res.status(200).json({ success: true, user });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});