import CourseModel, { ICourse } from "../models/course.model";
import UserModel from "../models/user.model";
import { redis } from "../utils/redis";
import ErrorHandler from "../utils/ErrorHandler";
import { minioClient } from "../utils/minioClient";

export const getCourseById = async (courseId: string, forClient: boolean = false): Promise<ICourse | null> => {
    const cacheKey = forClient ? `client_course_${courseId}` : `admin_course_${courseId}`;
    const cachedCourse = await redis.get(cacheKey);
    if (cachedCourse) { return JSON.parse(cachedCourse); }

    const selectFields = forClient ? "-modules.lessons.videoUrl -modules.lessons.resources" : "";
    const course = await CourseModel.findById(courseId).select(selectFields).lean();
    
    if (course) { await redis.set(cacheKey, JSON.stringify(course), "EX", 604800); }
    return course;
};

export const getAllCoursesForClient = async (): Promise<ICourse[]> => {
    const cached = await redis.get("allCourses_client");
    if (cached) { return JSON.parse(cached); }
    const courses = await CourseModel.find().select("-modules.lessons.videoUrl -modules.lessons.resources").lean();
    await redis.set("allCourses_client", JSON.stringify(courses), "EX", 604800);
    return courses;
};

export const getAllCoursesForAdmin = async (): Promise<ICourse[]> => {
    const cached = await redis.get("allCourses_admin");
    if (cached) { return JSON.parse(cached); }
    const courses = await CourseModel.find().sort({ createdAt: -1 }).lean();
    await redis.set("allCourses_admin", JSON.stringify(courses), "EX", 604800);
    return courses;
};

export const getCourseContentForUser = async (userId: string, courseId: string): Promise<any> => {
    const user = await UserModel.findById(userId);
    const isEnrolled = user?.courses.some((course: any) => course.toString() === courseId);
    if (!isEnrolled) { throw new ErrorHandler("You are not enrolled in this course", 403); }

    const course = await getCourseById(courseId, false); // Get full course data from our own service
    if (!course) { throw new ErrorHandler("Course not found", 404); }
    return course.modules;
};

export const getPresignedResourceUrl = async (params: { userId: string; courseId: string; moduleId: string; lessonId: string; resourceId: string; }): Promise<string> => {
    const content = await getCourseContentForUser(params.userId, params.courseId);
    const module = content.find((m: any) => m._id.toString() === params.moduleId);
    const lesson = module?.lessons.find((l: any) => l._id.toString() === params.lessonId);
    const resource = lesson?.resources.find((r: any) => r._id.toString() === params.resourceId);

    if (!resource?.file?.objectName) { throw new ErrorHandler("Resource not found", 404); }
    
    const { bucket, objectName, originalName } = resource.file;
    const url = await minioClient.presignedGetObject(
        bucket, objectName, 3600, { 'response-content-disposition': `attachment; filename="${originalName}"` }
    );
    return url;
};