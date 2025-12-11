import mongoose, { Document, Schema } from "mongoose";

export interface IAssignment extends Document {
  title: string;
  description: string;
  assignmentId: mongoose.Schema.Types.ObjectId;
}
export const assignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
});