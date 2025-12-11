import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import UserModel, { UserRole } from "../models/user.model";
import * as UserService from "../services/user.service";
import * as FileService from "../services/file.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";

// --- CONTROLLER FOR ADMIN-ONLY ACTIONS ON USERS ---

export const getAllAdmins = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const admins = await UserService.getAllUsersByRole(UserRole.ADMIN);
        res.status(200).json({ success: true, users: admins });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const getAllStudents = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const students = await UserService.getAllUsersByRole(UserRole.STUDENT);
        res.status(200).json({ success: true, students });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const createStudent = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, username, password, batch } = req.body;
        const isEmailExist = await UserModel.findOne({ email });
        if (isEmailExist) { return next(new ErrorHandler("Email already exists", 400)); }
        const isUsernameExist = await UserModel.findOne({ username });
        if (isUsernameExist) { return next(new ErrorHandler("Username has been taken", 400)); }

        const student = await UserModel.create({ name, email, username, password, batch, role: UserRole.STUDENT });
        res.status(201).json({ success: true, user: student });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const updateStudent = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, username, password, batch } = req.body;
        const userId = req.params.id;
        const user = await UserModel.findById(userId);
        if (!user || user.role !== UserRole.STUDENT) { return next(new ErrorHandler("Student not found", 404)); }

        const isEmailExist = await UserModel.findOne({ email, _id: { $ne: userId } });
        if (isEmailExist) { return next(new ErrorHandler("Email already exists", 400)); }
        
        user.name = name;
        user.email = email;
        user.username = username;
        user.batch = batch;
        if (password && password !== "") { user.password = password; }
        
        await user.save();
        await redis.set(user._id.toString(), JSON.stringify(user));
        res.status(200).json({ success: true, user });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

export const deleteUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) { return next(new ErrorHandler("User not found", 404)); }

        if (user.role === UserRole.STUDENT && user.courses && user.courses.length > 0) {
            await CourseModel.updateMany({ _id: { $in: user.courses } }, { $inc: { purchased: -1 } });
        }

        await user.deleteOne();
        await redis.del(id);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

export const deleteStudentAvatar = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;
      const user = await UserModel.findById(studentId);
      if (!user || user.role !== UserRole.STUDENT) { return next(new ErrorHandler("Student not found", 404)); }

      if (user.avatar && user.avatar.public_id) {
        await FileService.removeFileFromR2('marstech-lms-avatars-2025', user.avatar.public_id);
        user.avatar = undefined;
        await user.save();
        await redis.set(user._id.toString(), JSON.stringify(user));
        res.status(200).json({ success: true, message: "Avatar deleted.", user });
      } else {
        return next(new ErrorHandler("Student does not have an avatar.", 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
});

export const updateEnrollment = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, courseId } = req.body;
        const user = await UserModel.findById(userId);
        const course = await CourseModel.findById(courseId);

        if (!user || user.role !== UserRole.STUDENT || !course) {
            return next(new ErrorHandler("Student or Course not found", 404));
        }
        
        const courseIndex = user.courses.findIndex((c: any) => c.toString() === courseId);
        if (courseIndex > -1) {
            user.courses.splice(courseIndex, 1);
            course.purchased = Math.max(0, (course.purchased || 0) - 1);
        } else {
            user.courses.push(course._id as any);
            course.purchased = (course.purchased || 0) + 1;
        }
        
        await user.save();
        await course.save();

        await redis.set(user._id.toString(), JSON.stringify(user));
        await redis.del(courseId);
        await redis.del("allCourses");

        res.status(200).json({ success: true, user });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});