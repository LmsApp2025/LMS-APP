import express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { UserRole } from "../models/user.model";
import * as AuthController from "../controllers/auth.controller";
import * as UserController from "../controllers/user.controller";
import * as AdminController from "../controllers/admin.controller";

const userRouter = express.Router();

// --- AUTH ROUTES ---
userRouter.post("/registration", AuthController.registration);
userRouter.post("/activate-user", AuthController.activateUser);
userRouter.post("/admin-login", AuthController.login);
userRouter.post("/student-login", AuthController.login);
userRouter.post("/verify-otp", AuthController.verifyOtp);
userRouter.get("/logout", isAutheticated, AuthController.logout);
userRouter.get("/refresh", AuthController.refreshToken);

// --- CURRENT USER ROUTES ---
userRouter.get("/me", isAutheticated, UserController.getUserInfo);
userRouter.put("/avatar", isAutheticated, UserController.updateAvatar);

// --- ADMIN-ONLY ROUTES ---
const adminOnly = [isAutheticated, authorizeRoles(UserRole.ADMIN)];

// Get lists of users
userRouter.get("/get-admins", ...adminOnly, AdminController.getAllAdmins);
// FIXED: The route is now /admin/students (plural)
userRouter.get("/admin/students", ...adminOnly, AdminController.getAllStudents);

// Manage students
userRouter.post("/admin/create-student", ...adminOnly, AdminController.createStudent);
userRouter.put("/admin/update-student/:id", ...adminOnly, AdminController.updateStudent);
userRouter.delete("/admin/user/:id", ...adminOnly, AdminController.deleteUser);

userRouter.put("/admin/enrollment", ...adminOnly, AdminController.updateEnrollment);
userRouter.delete("/admin/student-avatar/:studentId", ...adminOnly, AdminController.deleteStudentAvatar);

export default userRouter;