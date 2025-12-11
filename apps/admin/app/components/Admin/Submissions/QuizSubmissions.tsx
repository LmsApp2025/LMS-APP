"use client";
import React, { FC, useMemo, useState, useEffect } from "react";
import { useGetQuizSubmissionsQuery, useDeleteQuizSubmissionMutation, useUpdateQuizSubmissionScoreMutation } from "@/redux/features/submissions/submissionsApi";
import { useGetAllCoursesQuery } from "@/redux/features/courses/coursesApi";
import Loader from "../../Loader/Loader";
import { styles } from "@/app/styles/style";
import { Box, Typography } from "@mui/material";
import { toast } from "react-hot-toast";
import { groupQuizSubmissions, findQuizContext } from "@/app/utils/SubmissionUtils";
import QuizSubmissionItem from "./QuizSubmissionItem";
import QuizSubmissionModal from "./QuizSubmissionModal";

const QuizSubmissions: FC<{ courseId: string }> = ({ courseId }) => {
  const { data, isLoading, refetch } = useGetQuizSubmissionsQuery(courseId, { refetchOnMountOrArgChange: true });
  const { data: coursesData, isLoading: coursesLoading } = useGetAllCoursesQuery({}, { refetchOnMountOrArgChange: true });
  const [deleteQuiz, { isSuccess: dSuccess, error: dError }] = useDeleteQuizSubmissionMutation();
  const [updateScore, { isSuccess: uSuccess, error: uError }] = useUpdateQuizSubmissionScoreMutation();

  const [modalData, setModalData] = useState<any>(null);
  const [editScore, setEditScore] = useState({ id: null as string | null, value: 0 });

  useEffect(() => {
    const success = dSuccess || uSuccess;
    const error = dError || uError;
    if (success) {
      toast.success("Operation successful!");
      refetch();
      setEditScore({ id: null, value: 0 });
    }
    // FIXED: Use a robust type guard for the error object
    if (error) {
      if (typeof error === 'object' && error !== null && 'data' in error && (error as any).data.message) {
        toast.error((error as any).data.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  }, [dSuccess, uSuccess, dError, uError, refetch]);
  
  const grouped = useMemo(() => groupQuizSubmissions(data?.submissions, coursesData?.courses), [data, coursesData]);

  const handleUpdateScore = () => {
    if (editScore.id) {
      updateScore({ submissionId: editScore.id, score: editScore.value });
    }
  };
  
  const handleViewDetails = (submission: any) => {
    const course = coursesData?.courses.find((c: any) => c._id === submission.courseId);
    if (course) {
        const details = findQuizContext(course, submission.quizId);
        setModalData({ submission, details });
    }
  };

  if (isLoading || coursesLoading) return <Loader />;

  return (
    <div className="mt-[120px] p-5">
      <h1 className={`${styles.title}`}>Quiz Submissions</h1>
      {Object.keys(grouped).length > 0 ? Object.values(grouped).map((user: any, i: number) => (
        <Box key={i} className="p-4 my-4 bg-white dark:bg-slate-800 rounded-lg shadow">
          <Typography variant="h5" className="!font-bold">{user.username}</Typography>
          {Object.values(user.courses).map((course: any, ci: number) => (
            <Box key={ci} className="p-3 my-2 border rounded bg-gray-50 dark:bg-slate-700">
                <Typography variant="h6">{course.courseName}</Typography>
                {Object.values(course.modules).map((m: any, mi: number) => (
                    <Box key={mi} sx={{ ml: 2, my: 1, borderLeft: '2px solid #ccc', pl: 2 }}>
                        <Typography color="text.secondary">{m.moduleTitle}</Typography>
                        {m.moduleQuizzes.map((q: any, qi: number) => <QuizSubmissionItem key={qi} submission={q} editState={editScore} onEdit={setEditScore} onView={handleViewDetails} onDelete={deleteQuiz} onSaveScore={handleUpdateScore} />)}
                        {Object.values(m.lessonQuizzes).map((l: any, li: number) => (
                            <Box key={li} sx={{ml: 2, my: 1}}>
                                <Typography color="text.secondary" fontStyle="italic">Lesson: {l.lessonTitle}</Typography>
                                {l.quizzes.map((q: any, qi: number) => <QuizSubmissionItem key={qi} submission={q} editState={editScore} onEdit={setEditScore} onView={handleViewDetails} onDelete={deleteQuiz} onSaveScore={handleUpdateScore} />)}
                            </Box>
                        ))}
                    </Box>
                ))}
                 {course.finalQuizzes.length > 0 && (
                    <Box sx={{ ml: 2, my: 1, borderLeft: '2px solid #f44336', pl: 2 }}>
                        <Typography color="error">Final Quizzes</Typography>
                        {course.finalQuizzes.map((q: any, qi: number) => <QuizSubmissionItem key={qi} submission={q} editState={editScore} onEdit={setEditScore} onView={handleViewDetails} onDelete={deleteQuiz} onSaveScore={handleUpdateScore} />)}
                    </Box>
                 )}
            </Box>
          ))}
        </Box>
      )) : <Typography align="center" sx={{mt: 5}}>No quiz submissions found for this course.</Typography>}
      <QuizSubmissionModal open={!!modalData} onClose={() => setModalData(null)} data={modalData} />
    </div>
  );
};
export default QuizSubmissions;