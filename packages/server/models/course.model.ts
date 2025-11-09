// C:\Lms-App - Copy\server\models\course.model.ts

import mongoose, { Document, Model, Schema } from "mongoose";
import { minioClient } from "../utils/minioClient";

export interface IQuizOption extends Document {
  optionText: string;
}

const quizOptionSchema = new Schema<IQuizOption>({
  optionText: { type: String, required: true },
});

export interface IQuizQuestion extends Document {
  questionText: string;
  options: IQuizOption[];
  correctAnswer: string;
}

const quizQuestionSchema = new Schema<IQuizQuestion>({
  questionText: { type: String, required: true },
  options: [quizOptionSchema],
  correctAnswer: { type: String, required: true },
});

export interface IQuiz extends Document {
  quizId: mongoose.Types.ObjectId; // Unique ID for each quiz category
  title: string;
  questions: IQuizQuestion[];
}

const quizSchema = new Schema<IQuiz>({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  title: { type: String, required: true },
  questions: [quizQuestionSchema],
});



// Schema for uploaded resources like PDFs, DOCX files
export interface IResource extends Document {
  title: string;
  file: {
    objectName: string;   // e.g., courseId/lessonId/resourceId/filename.pdf
    bucket: string;
    originalName: string; // e.g., "Lecture Notes Week 1.pdf"
    contentType: string;  // e.g., 'application/pdf'
  };
}

const resourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  file: {
    objectName: String,
    bucket: String,
    originalName: String,
    contentType: String,
  },
});

// Schema for an Assignment
export interface IAssignment extends Document {
  title: string;
  description: string;
  assignmentId: mongoose.Schema.Types.ObjectId;
}

const assignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
});

// Schema for a single Lesson (Unchanged)
export interface ILesson extends Document {
  title: string;
  // video: {
  //   objectName: string; // This will be the path to the .m3u8 file in MinIO
  //   bucket: string;
  // };
  videoUrl: string;
  resources: IResource[];
  quizzes?: IQuiz[];
}

const lessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  // video: {
  //   objectName: { type: String }, // Not required, as a lesson might be an assignment
  //   bucket: { type: String },
  // },
  videoUrl: { type: String },
  resources: [resourceSchema],
  quizzes: [quizSchema],
});

// --- SECTION SCHEMA HAS BEEN REMOVED ---

// --- MODIFIED: Schema for a Module ---
export interface IModule extends Document {
  moduleId: mongoose.Types.ObjectId;
  title: string;
  lessons: ILesson[]; // Now contains Lessons directly
  assignments: IAssignment[];
  quizzes?: IQuiz[];
}

const moduleSchema = new Schema<IModule>({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  title: { type: String, required: true },
  lessons: [lessonSchema], // Now references lessonSchema directly
   assignments: [assignmentSchema],
   quizzes: [quizSchema],
});

// --- Main Course Schema ---
export interface ICourse extends Document {
  name: string;
  description: string;
  categoryId: mongoose.Schema.Types.ObjectId;
  price?: number; // MODIFICATION: Added price
  estimatedPrice?: number; // MODIFICATION: Added estimatedPrice
  thumbnail: {
    public_id: string;
    url: string;
  };
  modules: IModule[];
  finalAssignments: IAssignment[];
  finalQuizzes?: IQuiz[];
  purchased?: number;
}

const courseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    price: { type: Number, default: 0 }, // MODIFICATION: Added price to schema
    estimatedPrice: { type: Number }, // MODIFICATION: Added estimatedPrice to schema
    thumbnail: {
      public_id: { type: String },
      url: { type: String },
    },
    modules: [moduleSchema],
    finalAssignments: [assignmentSchema], 
    finalQuizzes: [quizSchema],
    purchased: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

courseSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    const course = this;
    console.log(`[DELETER] Starting cleanup for course: ${course.name} (${course._id})`);

    try {
        // 1. Prepare lists of objects to delete from R2
        const objectsToDelete: { bucket: string, public_id: string }[] = [];

        // Add thumbnail to the delete list
        if (course.thumbnail?.public_id) {
            objectsToDelete.push({ bucket: 'marstech-lms-thumbnails-2025', public_id: course.thumbnail.public_id });
        }

        // Add all resources from all lessons to the delete list
        course.modules.forEach(module => {
            module.lessons.forEach(lesson => {
                lesson.resources.forEach(resource => {
                    if (resource.file?.objectName) {
                        objectsToDelete.push({ bucket: 'marstech-lms-resources-2025', public_id: resource.file.objectName });
                    }
                });
            });
        });

        // 2. Group objects by bucket and delete them
        if (objectsToDelete.length > 0) {
            console.log(`[DELETER] Found ${objectsToDelete.length} R2 objects to delete.`);
            
            // Group objects by bucket
            const groupedByBucket = objectsToDelete.reduce((acc, obj) => {
                if (!acc[obj.bucket]) {
                    acc[obj.bucket] = [];
                }
                acc[obj.bucket].push(obj.public_id);
                return acc;
            }, {} as Record<string, string[]>);

            // Perform a removeObjects call for each bucket
            for (const bucketName in groupedByBucket) {
                console.log(`[DELETER] Deleting ${groupedByBucket[bucketName].length} objects from bucket: ${bucketName}`);
                await minioClient.removeObjects(bucketName, groupedByBucket[bucketName]);
            }
            console.log(`[DELETER] Successfully deleted objects from R2.`);
        }

        // 3. Remove course from User/Student arrays (this logic might be better placed in the controller)
        await mongoose.model('Admin').updateMany(
            { "courses": course._id },
            { $pull: { courses: course._id } }
        );
        await mongoose.model('Student').updateMany(
            { "courses": course._id },
            { $pull: { courses: course._id } }
        );
        console.log(`[DELETER] Removed course reference from users and students.`);

        next();
    } catch (error: any) {
        console.error(`[DELETER] Error during course cleanup for ${course._id}:`, error);
        // We call next with the error to stop the delete process if cleanup fails
        next(error);
    }
});

const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);

export default CourseModel;