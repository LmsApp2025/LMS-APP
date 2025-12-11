"use client";
import React, { FC, useMemo, useState, useEffect } from "react";
import { useGetAssignmentSubmissionsQuery, useDeleteAssignmentSubmissionMutation } from "@/redux/features/submissions/submissionsApi";
import { useGetAllCoursesQuery } from "@/redux/features/courses/coursesApi";
import Loader from "../../Loader/Loader";
import { styles } from "@/app/styles/style";
import { Box, Typography } from "@mui/material";
import { toast } from "react-hot-toast";
import { groupAssignmentSubmissions } from "@/app/utils/SubmissionUtils";
import SubmissionGradingModal from "./SubmissionGradingModal";
import SubmissionItem from "./SubmissionItem";

const AssignmentSubmissions: FC<{courseId: string}> = ({ courseId }) => {
  const { data, isLoading, refetch } = useGetAssignmentSubmissionsQuery(courseId, { refetchOnMountOrArgChange: true });
  const { data: coursesData, isLoading: coursesLoading } = useGetAllCoursesQuery({}, { refetchOnMountOrArgChange: true });
  const [deleteSubmission, { isSuccess, error }] = useDeleteAssignmentSubmissionMutation();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Submission deleted successfully");
      refetch();
    }
    // FIXED: Use a robust type guard for the error object
    if (error) {
      if (typeof error === 'object' && error !== null && 'data' in error && (error as any).data.message) {
        toast.error((error as any).data.message);
      } else {
        toast.error("An error occurred while deleting.");
      }
    }
  }, [isSuccess, error, refetch]);
  
  const groupedData = useMemo(() => groupAssignmentSubmissions(data?.submissions, coursesData?.courses), [data, coursesData]);

  const handleDelete = (submissionId: string) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      deleteSubmission(submissionId);
    }
  };

  const handleGradeModalOpen = (submission: any) => {
    setSelectedSubmission(submission);
    setModalOpen(true);
  };

  if (isLoading || coursesLoading) return <Loader />;

  return (
    <div className="mt-[120px] p-5">
      <h1 className={`${styles.title}`}>Assignment Submissions</h1>
      
      {Object.keys(groupedData).length > 0 ? Object.values(groupedData).map((user: any, index: number) => (
        <Box key={index} className="p-4 my-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <Typography variant="h5" className="!font-bold !mb-3 dark:text-white text-black">{user.username}</Typography>
          {Object.values(user.courses).map((course: any, cIndex: number) => (
            <Box key={cIndex} className="p-3 my-2 border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-slate-700">
              <Typography variant="h6" className="!font-semibold !mb-2 dark:text-gray-200 text-gray-800">{course.courseName}</Typography>
              {course.moduleAssignments.length > 0 && <div><Typography className="!font-medium !underline dark:text-gray-300 text-gray-700">Module Assignments:</Typography>{course.moduleAssignments.map((asm: any, aIndex: number) => <SubmissionItem key={aIndex} submission={asm} onGrade={handleGradeModalOpen} onDelete={handleDelete} />)}</div>}
              {course.finalAssignments.length > 0 && <div><Typography className="!font-medium !underline dark:text-gray-300 text-gray-700">Final Assignments:</Typography>{course.finalAssignments.map((asm: any, aIndex: number) => <SubmissionItem key={aIndex} submission={asm} onGrade={handleGradeModalOpen} onDelete={handleDelete} />)}</div>}
            </Box>
          ))}
        </Box>
      )) : <Typography className="text-center mt-10">No assignment submissions for this course.</Typography>}

      {selectedSubmission && (
        <SubmissionGradingModal open={modalOpen} onClose={() => setModalOpen(false)} submission={selectedSubmission} refetch={refetch} />
      )}
    </div>
  );
};

export default AssignmentSubmissions;