import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import * as CourseWriteService from "../services/course.write.service";
import * as CourseReadService from "../services/course.read.service";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";

// --- ADMIN CONTROLLERS ---

export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await CourseWriteService.createCourse(req.body);
        res.status(201).json({ success: true, course });
    } catch (error: any) { return next(new ErrorHandler(error.message, 500)); }
});

export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await CourseWriteService.editCourse(req.params.id, req.body);
        res.status(200).json({ success: true, course });
    } catch (error: any) { return next(new ErrorHandler(error.message, 500)); }
});

export const getAdminAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await CourseReadService.getAllCoursesForAdmin();
        res.status(200).json({ success: true, courses });
    } catch (error: any) { return next(new ErrorHandler(error.message, 400)); }
});

export const deleteCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CourseWriteService.deleteCourseById(req.params.id);
        res.status(200).json({ success: true, message: "Course deleted successfully" });
    } catch (error: any) { return next(new ErrorHandler(error.message, 400)); }
});

export const deleteResourceFile = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, moduleId, lessonId, resourceId } = req.params;
        const updatedCourse = await CourseWriteService.deleteResource({ courseId, moduleId, lessonId, resourceId });
        res.status(200).json({ success: true, message: "Resource deleted", course: updatedCourse });
    } catch (error: any) { return next(new ErrorHandler(error.message, 500)); }
});


// --- PUBLIC & AUTHENTICATED CONTROLLERS ---

export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await CourseReadService.getCourseById(req.params.id, true);
        if (!course) { return next(new ErrorHandler("Course not found", 404)); }
        res.status(200).json({ success: true, course });
    } catch (error: any) { return next(new ErrorHandler(error.message, 500)); }
});

export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await CourseReadService.getAllCoursesForClient();
        res.status(200).json({ success: true, courses });
    } catch (error: any) { return next(new ErrorHandler(error.message, 500)); }
});

export const getCourseContent = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id as string;
        const content = await CourseReadService.getCourseContentForUser(userId, req.params.id);
        res.status(200).json({ success: true, content });
    } catch (error: any) { return next(new ErrorHandler(error.message, 500)); }
});

export const getResource = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.query.token as string;
        if (!refreshToken) { return next(new ErrorHandler("Token not provided", 401)); }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN!) as JwtPayload;
        const session = await redis.get(decoded.id);
        if (!session) { return next(new ErrorHandler("Session expired.", 401)); }
        
        const user = JSON.parse(session);
        const { courseId, moduleId, lessonId, resourceId } = req.params;
        const params = { userId: user._id, courseId, moduleId, lessonId, resourceId };
        
        const presignedUrl = await CourseReadService.getPresignedResourceUrl(params);
        res.redirect(presignedUrl);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});