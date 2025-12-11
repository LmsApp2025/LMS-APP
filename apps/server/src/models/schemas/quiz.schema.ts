import mongoose, { Document, Schema } from "mongoose";

export interface IQuizOption extends Document { optionText: string; }
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
  quizId: mongoose.Types.ObjectId;
  title: string;
  questions: IQuizQuestion[];
}
export const quizSchema = new Schema<IQuiz>({
  quizId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  title: { type: String, required: true },
  questions: [quizQuestionSchema],
});