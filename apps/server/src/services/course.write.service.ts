import CourseModel, { ICourse } from "../models/course.model";
import { slugify } from "../utils/slugify";
import * as FileService from "./file.service";
import { redis } from "../utils/redis";
import ErrorHandler from "../utils/ErrorHandler";

// Helper for processing module file uploads
async function processModuleUploads(modules: any[], courseSlug: string): Promise<any[]> {
    for (const module of modules) {
        for (const lesson of module.lessons || []) {
            const lessonSlug = slugify(lesson.title);
            for (const resource of lesson.resources || []) {
                if (resource.file && typeof resource.file === 'string' && resource.file.startsWith("data:")) {
                    const uploaded = await FileService.uploadBase64ToR2(
                        resource.file, 'marstech-lms-resources-2025', `${courseSlug}/${lessonSlug}/resources`
                    );
                    resource.file = { objectName: uploaded.public_id, bucket: 'marstech-lms-resources-2025', originalName: resource.title };
                }
            }
        }
    }
    return modules;
}

export const createCourse = async (data: any): Promise<ICourse> => {
    const courseSlug = slugify(data.name);
    if (data.thumbnail?.startsWith("data:")) {
        data.thumbnail = await FileService.uploadBase64ToR2(data.thumbnail, 'marstech-lms-thumbnails-2025', `${courseSlug}/thumbnail`);
    }
    if (data.modules) {
        data.modules = await processModuleUploads(data.modules, courseSlug);
    }
    const course = await CourseModel.create(data);
    await redis.del("allCourses_client");
    return course;
};

export const editCourse = async (courseId: string, data: any): Promise<ICourse | null> => {
    const courseSlug = slugify(data.name);
    if (data.thumbnail?.startsWith("data:")) {
        const oldCourse = await CourseModel.findById(courseId);
        if(oldCourse?.thumbnail?.public_id){
            await FileService.removeFileFromR2('marstech-lms-thumbnails-2025', oldCourse.thumbnail.public_id);
        }
        data.thumbnail = await FileService.uploadBase64ToR2(data.thumbnail, 'marstech-lms-thumbnails-2025', `${courseSlug}/thumbnail`);
    }
    if (data.modules) {
        data.modules = await processModuleUploads(data.modules, courseSlug);
    }
    const course = await CourseModel.findByIdAndUpdate(courseId, { $set: data }, { new: true });
    if (course) {
        await redis.del(`client_course_${courseId}`);
        await redis.del(`admin_course_${courseId}`);
        await redis.del("allCourses_client");
        await redis.del("allCourses_admin");
    }
    return course;
};

export const deleteCourseById = async (courseId: string): Promise<void> => {
    const course = await CourseModel.findById(courseId);
    if (!course) { throw new ErrorHandler("Course not found", 404); }
    await course.deleteOne();
    await redis.del(`client_course_${courseId}`);
    await redis.del(`admin_course_${courseId}`);
    await redis.del("allCourses_client");
    await redis.del("allCourses_admin");
};

export const deleteResource = async (params: { courseId: string; moduleId: string; lessonId: string; resourceId: string; }): Promise<ICourse> => {
    const course = await CourseModel.findById(params.courseId);
    if (!course) throw new ErrorHandler("Course not found", 404);
    const module = course.modules.find(m => m._id.toString() === params.moduleId);
    const lesson = module?.lessons.find(l => l._id.toString() === params.lessonId);
    const resourceIndex = lesson?.resources.findIndex(r => r._id.toString() === params.resourceId);

    if (!lesson || resourceIndex === undefined || resourceIndex === -1) {
        throw new ErrorHandler("Resource not found", 404);
    }
    
    const resource = lesson.resources[resourceIndex];
    if (resource.file?.objectName) {
        await FileService.removeFileFromR2(resource.file.bucket, resource.file.objectName);
    }
    
    lesson.resources.splice(resourceIndex, 1);
    await course.save();
    await redis.del(`admin_course_${params.courseId}`);
    await redis.del("allCourses_admin");
    return course;
};