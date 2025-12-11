// In: apps/admin/app/components/Admin/Users/StudentCardEdit.tsx

import React, { FC, useState } from 'react';
import { Box, Button, TextField } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

type Props = {
  student: any;
  onSave: (data: any) => void;
  onCancel: () => void;
};

const StudentCardEdit: FC<Props> = ({ student, onSave, onCancel }) => {
  const [data, setData] = useState({ ...student, password: "" });

  const handleSave = () => {
    // Only pass non-empty fields to the save function
    const saveData = { ...data };
    if (saveData.password === "") {
        delete saveData.password;
    }
    onSave(saveData);
  };

  return (
    <Box className="p-4 bg-white dark:bg-slate-800 rounded-md shadow-sm my-2 border-2 border-blue-500">
      <TextField label="Full Name" value={data.name} onChange={(e) => setData({...data, name: e.target.value})} fullWidth margin="dense" size="small" />
      <TextField label="Batch Number" value={data.batch} onChange={(e) => setData({...data, batch: e.target.value})} fullWidth margin="dense" size="small" />
      <TextField label="Email Address" value={data.email} onChange={(e) => setData({...data, email: e.target.value})} fullWidth margin="dense" size="small" />
      <TextField label="Username" value={data.username} onChange={(e) => setData({...data, username: e.target.value})} fullWidth margin="dense" size="small" />
      <TextField label="Password (leave blank to keep)" type="password" value={data.password} onChange={(e) => setData({...data, password: e.target.value})} fullWidth margin="dense" size="small" />
      <Box className="flex justify-end gap-2 mt-2">
        <Button onClick={onCancel} startIcon={<CancelIcon />}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>Save</Button>
      </Box>
    </Box>
  );
};

export default StudentCardEdit;