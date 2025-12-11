import { Document, Schema } from "mongoose";
import { IQuiz, quizSchema } from "./quiz.schema";
import { IResource, resourceSchema } from "./resource.schema";

export interface ILesson extends Document {
  title: string;
  videoUrl: string;
  resources: IResource[];
  quizzes?: IQuiz[];
}
export const lessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  videoUrl: { type: String },
  resources: [resourceSchema],
  quizzes: [quizSchema],
});