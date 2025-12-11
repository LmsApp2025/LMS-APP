import CourseModel from "../models/course.model";
import QuizSubmissionModel from "../models/quizSubmission.model";
import AssignmentSubmissionModel from "../models/submission.model";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
// CORRECTED: Import interfaces from their new schema files
import { IQuiz, IQuizQuestion } from "../models/schemas/quiz.schema";

// Helper to upload files to Cloudinary
const uploadFile = async (file: string, folder: string) => {
    const result = await cloudinary.v2.uploader.upload(file, { folder, resource_type: "auto" });
    return { public_id: result.public_id, url: result.secure_url };
};

export const createAssignmentSubmission = async (data: { courseId: string; assignmentId: string; content: any; userId: string; userCourses: any[] }) => {
    const { courseId, assignmentId, content, userId, userCourses } = data;

    const isEnrolled = userCourses.some((c: any) => c.toString() === courseId);
    if (!isEnrolled) { throw new ErrorHandler("You are not enrolled in this course", 403); }

    const existing = await AssignmentSubmissionModel.findOne({ userId, assignmentId });
    if (existing) { throw new ErrorHandler("You have already submitted for this assignment", 400); }

    const submissionData: any = { courseId, assignmentId, userId, content: {}, status: "submitted" };
    if (content.format === "link" && content.url) {
        submissionData.content = { format: "link", url: content.url };
    } else if (content.format === "file" && content.file) {
        const uploaded = await uploadFile(content.file, "assignment_submissions");
        submissionData.content = { format: "file", file: uploaded };
    } else {
        throw new ErrorHandler("Invalid submission content", 400);
    }
    
    return await AssignmentSubmissionModel.create(submissionData);
};

export const submitQuiz = async (data: { courseId: string; quizId: string; answers: any[]; userId: string; }) => {
    const { courseId, quizId, answers, userId } = data;

    const course = await CourseModel.findById(courseId);
    if (!course) { throw new ErrorHandler("Course not found", 404); }
    
    // Logic to find the specific quiz
    let targetQuiz: (IQuiz & { questions: IQuizQuestion[] }) | null = null;
    const allQuizzes = [...(course.finalQuizzes || []), ...course.modules.flatMap(m => [...(m.quizzes || []), ...(m.lessons.flatMap(l => l.quizzes || []))])];
    // CORRECTED: Added type annotation for 'q' to resolve implicit 'any'
    targetQuiz = allQuizzes.find((q: IQuiz) => q.quizId.toString() === quizId) || null;

    if (!targetQuiz) { throw new ErrorHandler("Quiz not found in this course", 404); }

    const existing = await QuizSubmissionModel.findOne({ userId, quizId });
    if (existing) { throw new ErrorHandler("You have already submitted this quiz.", 400); }

    let score = 0;
    targetQuiz.questions.forEach((q) => {
        const userAnswer = answers.find(a => a.questionId === q._id.toString());
        if (userAnswer && userAnswer.selectedOption === q.correctAnswer) { score++; }
    });

    await QuizSubmissionModel.create({ userId, courseId, quizId, answers, score, totalQuestions: targetQuiz.questions.length });
    return { score, totalQuestions: targetQuiz.questions.length };
};