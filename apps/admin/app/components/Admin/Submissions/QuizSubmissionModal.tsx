// In: apps/admin/app/components/Admin/Submissions/QuizSubmissionModal.tsx (NEW)

import React, { FC } from 'react';
import { Box, Modal, Button, Typography } from "@mui/material";

type Props = { open: boolean; onClose: () => void; data: { submission: any, details: any } | null; };

const QuizSubmissionModal: FC<Props> = ({ open, onClose, data }) => {
  if (!data) return null;
  return (
    <Modal open={open} onClose={onClose}>
      <Box className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[800px] h-[80vh] bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 overflow-y-auto">
        <Typography variant="h5" className="!font-bold !mb-4">Result Details</Typography>
        <Typography><strong>Student:</strong> {data.submission.userId.name}</Typography>
        <Typography><strong>Course:</strong> {data.details.courseName}</Typography>
        <Box sx={{ my: 3 }}>
          {data.details.quiz.questions.map((q: any, idx: number) => {
            const userAns = data.submission.answers.find((a: any) => a.questionId === q._id);
            return (
              <Box key={idx} sx={{ my: 2, p: 2, bgcolor: 'background.paper', border: '1px solid #ccc', borderRadius: 2 }}>
                <Typography><strong>{idx + 1}. {q.questionText}</strong></Typography>
                {q.options.map((opt: any, oIdx: number) => (
                    <Typography key={oIdx} sx={{ ml: 2, color: opt.optionText === q.correctAnswer ? 'green' : (userAns?.selectedOption === opt.optionText ? 'red' : 'inherit') }}>
                        {opt.optionText} {opt.optionText === q.correctAnswer && "(Correct)"}
                    </Typography>
                ))}
              </Box>
            );
          })}
        </Box>
        <Button onClick={onClose} variant="contained">Close</Button>
      </Box>
    </Modal>
  );
};
export default QuizSubmissionModal;