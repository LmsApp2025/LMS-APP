import { Document, Schema } from "mongoose";

export interface IResource extends Document {
  title: string;
  file: {
    objectName: string;
    bucket: string;
    originalName: string;
    contentType: string;
  };
}
export const resourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  file: { objectName: String, bucket: String, originalName: String, contentType: String },
});