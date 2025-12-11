// In: apps/admin/app/components/Admin/Users/StudentCardView.tsx

import React, { FC, useState } from 'react';
import { Box, Button, Typography } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import UserAvatar from "./UserAvatar";
import EnrollmentManager from "./EnrollmentManager";

type Props = {
  student: any;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onRefetch: () => void;
};

const StudentCardView: FC<Props> = ({ student, onEdit, onDelete, onRefetch }) => {
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);

  return (
    <>
      <Box className="p-4 bg-white dark:bg-slate-800 rounded-md shadow-sm my-2 flex justify-between items-center flex-wrap">
        <Box className="flex items-center gap-4 mb-2 md:mb-0">
          <UserAvatar student={student} onAvatarChange={onRefetch} />
          <Box>
            <Typography><strong>Name:</strong> {student.name}</Typography>
            <Typography><strong>Email:</strong> {student.email}</Typography>
            <Typography><strong>Username:</strong> {student.username}</Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Typography><strong>Enrolled Courses:</strong></Typography>
          <Button size="small" startIcon={<EditIcon />} onClick={() => setEnrollmentModalOpen(true)}>
            Edit Enrollments
          </Button>
          {student.courses && student.courses.length > 0 ? (
            student.courses.map((course: any) => (
              <Typography key={course._id} variant="body2" sx={{ ml: 2 }}>- {course.name}</Typography>
            ))
          ) : (
            <Typography variant="body2" sx={{ ml: 2, fontStyle: 'italic' }}>Not enrolled.</Typography>
          )}
        </Box>
        <Box>
          <Button onClick={onEdit}>Edit Details</Button>
          <Button color="error" onClick={() => onDelete(student._id)}>Delete</Button>
        </Box>
      </Box>
      <EnrollmentManager 
        student={student} 
        open={enrollmentModalOpen} 
        onClose={() => setEnrollmentModalOpen(false)}
        onUpdate={onRefetch}
      />
    </>
  );
};

export default StudentCardView;