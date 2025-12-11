import mongoose, { Document, Schema } from "mongoose";
import { IAssignment, assignmentSchema } from "./assignment.schema";
import { ILesson, lessonSchema } from "./lesson.schema";
import { IQuiz, quizSchema } from "./quiz.schema";

export interface IModule extends Document {
  moduleId: mongoose.Types.ObjectId;
  title: string;
  lessons: ILesson[];
  assignments: IAssignment[];
  quizzes?: IQuiz[];
}
export const moduleSchema = new Schema<IModule>({
  moduleId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  title: { type: String, required: true },
  lessons: [lessonSchema],
  assignments: [assignmentSchema],
  quizzes: [quizSchema],
});