import React, { FC } from "react";
import { Box, Button, TextField, IconButton } from "@mui/material";
import { AiOutlineDelete, AiOutlinePlusCircle } from "react-icons/ai";
import { styles } from "@/app/styles/style";

type Props = {
  assignments: any[];
  setAssignments: (assignments: any[]) => void;
  title: string;
};

const AssignmentForm: FC<Props> = ({ assignments, setAssignments, title }) => {
  const handleAssignmentChange = (index: number, field: string, value: string) => {
    const updated = [...assignments];
    updated[index] = { ...updated[index], [field]: value };
    setAssignments(updated);
  };

  const addAssignment = () => {
    setAssignments([...assignments, { title: "", description: "" }]);
  };

  const removeAssignment = (index: number) => {
    if (assignments.length > 0) { // Can remove even the last one
      const updated = [...assignments];
      updated.splice(index, 1);
      setAssignments(updated);
    }
  };

  return (
    <Box>
      <label className={`${styles.label} text-[20px]`}>{title}</label>
      {assignments.map((assignment, index) => (
        <Box key={index} className="my-4 border rounded-md p-4 relative bg-purple-100 dark:bg-purple-900/30">
          <TextField label="Assignment Title" value={assignment.title} onChange={(e) => handleAssignmentChange(index, 'title', e.target.value)} fullWidth variant="outlined" sx={{ mb: 2, backgroundColor: '#fff' }}/>
          <TextField label="Assignment Description" value={assignment.description} onChange={(e) => handleAssignmentChange(index, 'description', e.target.value)} fullWidth multiline rows={3} variant="outlined" sx={{ backgroundColor: '#fff' }}/>
          <IconButton onClick={() => removeAssignment(index)} sx={{ position: 'absolute', top: 10, right: 10 }}><AiOutlineDelete color="red" /></IconButton>
        </Box>
      ))}
      <Button startIcon={<AiOutlinePlusCircle />} onClick={addAssignment}>Add Assignment</Button>
    </Box>
  );
};

export default AssignmentForm;