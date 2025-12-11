import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import * as SubmissionService from "../services/submission.service";
import AssignmentSubmissionModel from "../models/submission.model";
import QuizSubmissionModel from "../models/quizSubmission.model";

// --- STUDENT ACTIONS ---

export const createAssignmentSubmission = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, assignmentId, content } = req.body;
        const userId = req.user?._id as string;
        const userCourses = req.user?.courses || [];
        const submission = await SubmissionService.createAssignmentSubmission({ courseId, assignmentId, content, userId, userCourses });
        res.status(201).json({ success: true, submission });
    } catch (error: any) { return next(new ErrorHandler(error.message, error.statusCode || 500)); }
});

export const submitQuiz = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, quizId, answers } = req.body;
        const userId = req.user?._id as string;
        const result = await SubmissionService.submitQuiz({ courseId, quizId, answers, userId });
        res.status(200).json({ success: true, message: "Quiz submitted successfully.", ...result });
    } catch (error: any) { return next(new ErrorHandler(error.message, error.statusCode || 500)); }
});

export const getUserSubmission = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { assignmentId } = req.params;
        const userId = req.user?._id;
        const submission = await AssignmentSubmissionModel.findOne({ userId, assignmentId });
        res.status(200).json({ success: true, submission });
    } catch (error: any) { return next(new ErrorHandler(error.message, 500)); }
});

export const getUserQuizSubmission = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { quizId } = req.params;
        const submission = await QuizSubmissionModel.findOne({ userId: req.user?._id, quizId });
        res.status(200).json({ success: true, submission });
    } catch (error: any) { return next(new ErrorHandler(error.message, 500)); }
});


// --- ADMIN ACTIONS ---

export const getAssignmentSubmissions = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const submissions = await AssignmentSubmissionModel.find({ courseId: req.params.courseId }).populate('userId', 'name email username').sort({ createdAt: -1 });
        res.status(200).json({ success: true, submissions });
    } catch (error: any) { return next(new ErrorHandler(error.message, 500)); }
});

export const getQuizSubmissions = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const submissions = await QuizSubmissionModel.find({ courseId: req.params.courseId }).populate('userId', 'name email username').sort({ createdAt: -1 });
        res.status(200).json({ success: true, submissions });
    } catch (error: any) { return next(new ErrorHandler(error.message, 500)); }
});

export const gradeAssignmentSubmission = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { grade, feedback, status } = req.body;
        const submission = await AssignmentSubmissionModel.findByIdAndUpdate(
            req.params.submissionId, { grade, feedback, status }, { new: true }
        );
        if (!submission) { return next(new ErrorHandler("Submission not found", 404)); }
        res.status(200).json({ success: true, submission });
    } catch (error: any) { return next(new ErrorHandler(error.message, 500)); }
});

export const updateQuizSubmissionScore = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { score } = req.body;
        if (typeof score !== 'number') { return next(new ErrorHandler("Score must be a number", 400)); }
        const submission = await QuizSubmissionModel.findByIdAndUpdate(req.params.submissionId, { score }, { new: true });
        if (!submission) { return next(new ErrorHandler("Submission not found", 404)); }
        res.status(200).json({ success: true, submission });
    } catch (error: any) { return next(new ErrorHandler(error.message, 500)); }
});

export const deleteAssignmentSubmission = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const submission = await AssignmentSubmissionModel.findByIdAndDelete(req.params.submissionId);
        if (!submission) { return next(new ErrorHandler("Submission not found", 404)); }
        res.status(200).json({ success: true, message: "Submission deleted." });
    } catch (error: any) { return next(new ErrorHandler(error.message, 500)); }
});

export const deleteQuizSubmission = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const submission = await QuizSubmissionModel.findByIdAndDelete(req.params.submissionId);
        if (!submission) { return next(new ErrorHandler("Submission not found", 404)); }
        res.status(200).json({ success: true, message: "Submission deleted." });
    } catch (error: any) { return next(new ErrorHandler(error.message, 500)); }
});