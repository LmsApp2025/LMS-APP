import React, { FC } from 'react';
import { Box, Typography, IconButton, Link } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

type Props = {
  submission: any;
  onGrade: (submission: any) => void;
  onDelete: (id: string) => void;
};

const SubmissionItem: FC<Props> = ({ submission, onGrade, onDelete }) => {
  const getStatusColor = (status: string) => {
    if (status === 'graded') return 'green';
    if (status === 'needs revision') return 'red';
    return 'orange';
  };

  return (
    <Box className="ml-4 mt-2 p-2 rounded bg-white dark:bg-slate-800/50 flex justify-between items-center flex-wrap">
      <Box className="flex-grow">
        <Typography>
          <span className="font-semibold">{submission.title}: </span>
          <Link href={submission.link} target="_blank" rel="noopener noreferrer">{submission.link}</Link>
        </Typography>
        <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mt-1 capitalize">
          Status: <span style={{ color: getStatusColor(submission.status) }}>{submission.status}</span>
          {submission.grade && ` | Grade: ${submission.grade}`}
        </Typography>
      </Box>
      <Box>
        <IconButton size="small" onClick={() => onGrade(submission)}><EditIcon /></IconButton>
        <IconButton size="small" onClick={() => onDelete(submission._id)}><DeleteIcon color="error" /></IconButton>
      </Box>
    </Box>
  );
};

export default SubmissionItem;