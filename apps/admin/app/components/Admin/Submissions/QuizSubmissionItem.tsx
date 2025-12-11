// In: apps/admin/app/components/Admin/Submissions/QuizSubmissionItem.tsx (NEW)

import React, { FC } from 'react';
import { Box, Typography, IconButton, TextField, Button } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

type Props = { submission: any; editState: any; onEdit: any; onView: any; onDelete: any; onSaveScore: any; };

const QuizSubmissionItem: FC<Props> = ({ submission, editState, onEdit, onView, onDelete, onSaveScore }) => (
  <Box className="flex items-center justify-between ml-4 mt-2 p-2 rounded bg-white dark:bg-slate-800/50 flex-wrap border border-gray-200">
    <Typography>{submission.quizTitle}</Typography>
    <Box className="flex items-center gap-2">
      {editState.id === submission._id ? (
        <>
          <TextField type="number" size="small" value={editState.value} onChange={(e) => onEdit({ ...editState, value: parseInt(e.target.value) })} sx={{ width: 70 }} />
          <Button size="small" onClick={onSaveScore}>Save</Button>
        </>
      ) : (
        <Typography>Score: {submission.score}/{submission.totalQuestions}</Typography>
      )}
      <IconButton size="small" onClick={() => onEdit({ id: submission._id, value: submission.score })}><EditIcon /></IconButton>
      <IconButton size="small" onClick={() => onView(submission)}><VisibilityIcon /></IconButton>
      <IconButton size="small" onClick={() => onDelete(submission._id)}><DeleteIcon color="error" /></IconButton>
    </Box>
  </Box>
);
export default QuizSubmissionItem;