require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Define roles using an enum for type safety and clarity
export enum UserRole {
  ADMIN = "admin",
  STUDENT = "student",
}

// This is our single source of truth for a User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  username?: string; // Optional: Only required for students
  batch?: string;    // Optional: Only required for students
  role: UserRole;
  avatar?: {
    public_id: string;
    url: string;
  };
  isVerified?: boolean; // For admin activation
  courses: mongoose.Types.ObjectId[];
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    validate: { validator: (value: string) => emailRegexPattern.test(value), message: "Please enter a valid email" },
    unique: true,
  },
  password: { type: String, required: [true, "A password is required"], minlength: 6, select: false },
  username: { type: String, unique: true, sparse: true }, // 'sparse: true' allows nulls while enforcing uniqueness for actual values
  batch: { type: String },
  role: { type: String, enum: Object.values(UserRole), required: true },
  avatar: { public_id: String, url: String },
  isVerified: { type: Boolean, default: false },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
}, { timestamps: true });

// Pre-save hook for password hashing remains the same
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// JWT methods can be simplified and attached here
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
    expiresIn: "15m",
  });
};

userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {
    expiresIn: "30d",
  });
};

// Password comparison method remains the same
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel: Model<IUser> = mongoose.model("User", userSchema);
export default UserModel;