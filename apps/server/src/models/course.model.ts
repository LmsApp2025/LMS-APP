import mongoose, { Document, Model, Schema } from "mongoose";
import * as FileService from "../services/file.service";
import { IAssignment, assignmentSchema } from "./schemas/assignment.schema";
import { IModule, moduleSchema } from "./schemas/module.schema";
import { IQuiz, quizSchema } from "./schemas/quiz.schema";

export interface ICourse extends Document {
  name: string;
  description: string;
  categoryId: mongoose.Schema.Types.ObjectId;
  price?: number;
  estimatedPrice?: number;
  thumbnail: { public_id: string; url: string; };
  modules: IModule[];
  finalAssignments: IAssignment[];
  finalQuizzes?: IQuiz[];
  purchased?: number;
}

const courseSchema = new Schema<ICourse>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    price: { type: Number, default: 0 },
    estimatedPrice: { type: Number },
    thumbnail: { public_id: { type: String }, url: { type: String } },
    modules: [moduleSchema],
    finalAssignments: [assignmentSchema], 
    finalQuizzes: [quizSchema],
    purchased: { type: Number, default: 0 },
  }, { timestamps: true }
);

courseSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    const course = this;
    console.log(`[DELETER] Starting cleanup for course: ${course.name} (${course._id})`);
    try {
        if (course.thumbnail?.public_id) {
            await FileService.removeFileFromR2('marstech-lms-thumbnails-2025', course.thumbnail.public_id);
        }

        for (const module of course.modules) {
            for (const lesson of module.lessons) {
                for (const resource of lesson.resources) {
                    if (resource.file?.objectName) {
                        await FileService.removeFileFromR2('marstech-lms-resources-2025', resource.file.objectName);
                    }
                }
            }
        }
        
        await mongoose.model('User').updateMany({ "courses": course._id }, { $pull: { courses: course._id } });
        console.log(`[DELETER] Removed course reference from users.`);
        next();
    } catch (error: any) {
        console.error(`[DELETER] Error during course cleanup for ${course._id}:`, error);
        next(error);
    }
});

const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);
export default CourseModel;