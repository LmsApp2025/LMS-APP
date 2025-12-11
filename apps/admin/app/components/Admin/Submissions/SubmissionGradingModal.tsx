import React, { FC, useState, useEffect } from 'react';
import { Box, Typography, Modal, TextField, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress } from "@mui/material";
import { useGradeAssignmentSubmissionMutation } from "@/redux/features/submissions/submissionsApi";
import { toast } from 'react-hot-toast';

type Props = {
  open: boolean;
  onClose: () => void;
  submission: any;
  refetch: () => void;
};

const SubmissionGradingModal: FC<Props> = ({ open, onClose, submission, refetch }) => {
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("graded");
  const [gradeSubmission, { isLoading, isSuccess, error }] = useGradeAssignmentSubmissionMutation();

  useEffect(() => {
    if (submission) {
      setGrade(submission.grade || "");
      setFeedback(submission.feedback || "");
      setStatus(submission.status === 'pending' || submission.status === 'submitted' ? 'graded' : submission.status);
    }
  }, [submission]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Submission graded successfully");
      refetch();
      onClose();
    }
    // FIXED: Use a robust type guard for the error object
    if (error) {
      if (typeof error === 'object' && error !== null && 'data' in error && (error as any).data.message) {
        toast.error((error as any).data.message);
      } else {
        toast.error("An error occurred while grading.");
      }
    }
  }, [isSuccess, error, refetch, onClose]);

  const handleSubmit = () => {
    if (!submission) return;
    gradeSubmission({ submissionId: submission._id, grade, feedback, status });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[500px] bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6">
        <Typography variant="h5" className="!font-bold !mb-4">Grade Submission</Typography>
        <TextField label="Grade (e.g., A+, 85/100)" fullWidth value={grade} onChange={(e) => setGrade(e.target.value)} margin="normal" />
        <TextField label="Feedback" fullWidth multiline rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} margin="normal" />
        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="submitted">Submitted</MenuItem>
            <MenuItem value="graded">Graded</MenuItem>
            <MenuItem value="needs revision">Needs Revision</MenuItem>
          </Select>
        </FormControl>
        <Box className="flex justify-end mt-4 gap-4">
          <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Submit Grade"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SubmissionGradingModal;