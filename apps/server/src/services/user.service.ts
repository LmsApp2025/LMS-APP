// In: apps/server/src/services/user.service.ts (REFACTORED)

import { redis } from "../utils/redis";
import UserModel, { UserRole } from "../models/user.model";

// Get user by ID service
export const getUserById = async (id: string) => {
  const userJson = await redis.get(id);
  if (userJson) {
    return JSON.parse(userJson);
  }
  // Optional: Fetch from DB if not in cache
  const user = await UserModel.findById(id);
  if (user) {
    await redis.set(id, JSON.stringify(user));
  }
  return user;
};

// Get all users by role service
export const getAllUsersByRole = async (role: UserRole) => {
  const users = await UserModel.find({ role }).populate("courses").sort({ createdAt: -1 });
  return users;
};

// Get all users service (general)
export const getAllUsers = async () => {
    const users = await UserModel.find().sort({ createdAt: -1 });
    return users;
};

// Update user role service
export const updateUserRole = async (id: string, role: UserRole) => {
  const user = await UserModel.findByIdAndUpdate(id, { role }, { new: true });
  return user;
};