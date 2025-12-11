// In: apps/server/src/routes/user.route.ts (FINAL CORRECTED VERSION)

import express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { UserRole } from "../models/user.model";

// Import from our new, split controllers
import * as AuthController from "../controllers/auth.controller";
import * as UserController from "../controllers/user.controller";
import * as AdminController from "../controllers/admin.controller";

const userRouter = express.Router();

// --- AUTH ROUTES (Public) ---
userRouter.post("/registration", AuthController.registration);
userRouter.post("/activate-user", AuthController.activateUser);

// FIXED: Restore the original admin-login and student-login routes.
// Both routes now point to the same powerful, unified login controller.
userRouter.post("/admin-login", AuthController.login);
userRouter.post("/student-login", AuthController.login);

userRouter.post("/verify-otp", AuthController.verifyOtp); // For student login
userRouter.get("/logout", isAutheticated, AuthController.logout);
userRouter.get("/refresh", AuthController.refreshToken);


// --- CURRENT USER ROUTES (Protected - for any logged-in user) ---
userRouter.get("/me", isAutheticated, UserController.getUserInfo);
userRouter.put("/avatar", isAutheticated, UserController.updateAvatar);


// --- ADMIN-ONLY ROUTES (Protected & Role-Authorized) ---
const adminOnly = [isAutheticated, authorizeRoles(UserRole.ADMIN)];

// Get lists of users
userRouter.get("/admin/admins", ...adminOnly, AdminController.getAllAdmins);
userRouter.get("/admin/students", ...adminOnly, AdminController.getAllStudents);

// Manage students
userRouter.post("/admin/student", ...adminOnly, AdminController.createStudent);
userRouter.put("/admin/student/:id", ...adminOnly, AdminController.updateStudent);
userRouter.delete("/admin/user/:id", ...adminOnly, AdminController.deleteUser);

// Manage student specifics
userRouter.put("/admin/enrollment", ...adminOnly, AdminController.updateEnrollment);
userRouter.delete("/admin/student-avatar/:studentId", ...adminOnly, AdminController.deleteStudentAvatar);

export default userRouter;