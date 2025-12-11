// In: apps/admin/app/components/Admin/Users/StudentProvisioning.tsx (CORRECTED)

"use client";
import React, { FC, useEffect, useState, useMemo } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useGetAllStudentsQuery, useAdminCreateStudentMutation, useAdminUpdateStudentMutation, useAdminDeleteStudentMutation } from "@/redux/features/user/userApi";
import Loader from "../../Loader/Loader";
import { styles } from "@/app/styles/style";
import { toast } from "react-hot-toast";
import AddIcon from '@mui/icons-material/Add';
import StudentCardView from "./StudentCardView";
import StudentCardEdit from "./StudentCardEdit";

// A unique symbol for the temporary new student object
const NEW_STUDENT_ID = Symbol("new-student");

const StudentProvisioning: FC = () => {
  const { isLoading, data: studentsData, refetch } = useGetAllStudentsQuery({});
  const [createStudent, { isSuccess: createSuccess, error: createError }] = useAdminCreateStudentMutation();
  const [updateStudent, { isSuccess: updateSuccess, error: updateError }] = useAdminUpdateStudentMutation();
  const [deleteStudent, { isSuccess: deleteSuccess, error: deleteError }] = useAdminDeleteStudentMutation();
  
  const [editingStudentId, setEditingStudentId] = useState<string | symbol | null>(null);
  const [newStudentBatch, setNewStudentBatch] = useState<string>("");

  useEffect(() => {
    const success = createSuccess || updateSuccess || deleteSuccess;
    const error = createError || updateError || deleteError;
    if (success) {
      toast.success("Operation successful!");
      setEditingStudentId(null);
      refetch();
    }
    if (error) {
      // FIXED: Use a type guard to safely check the error structure.
      if (typeof error === 'object' && error !== null && 'data' in error && (error as any).data.message) {
        toast.error((error as any).data.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }, [createSuccess, updateSuccess, deleteSuccess, createError, updateError, deleteError, refetch]);

  const studentsByBatch = useMemo(() => {
    const students = studentsData?.students || [];
    return students.reduce((acc: any, student: any) => {
        const batch = student.batch || "Uncategorized";
        if (!acc[batch]) { acc[batch] = []; }
        acc[batch].push(student);
        return acc;
    }, {});
  }, [studentsData]);

  const handleAddNewStudent = (batch: string) => {
    setNewStudentBatch(batch === 'Uncategorized' ? "" : batch);
    setEditingStudentId(NEW_STUDENT_ID);
  };

  const handleSaveStudent = (studentData: any) => {
    if (studentData._id === NEW_STUDENT_ID) {
      const { _id, ...rest } = studentData; // Remove the temporary ID before sending to API
      createStudent(rest);
    } else {
      updateStudent({ id: studentData._id, ...studentData });
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      deleteStudent(studentId);
    }
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
  };

  return (
    <div className="mt-[120px] p-5">
      {isLoading ? <Loader /> : (
        <>
          <Box className="flex justify-between items-center">
            <h1 className={`${styles.title} !text-left`}>Student Provisioning</h1>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAddNewStudent("Uncategorized")}>Add New Student</Button>
          </Box>

          {editingStudentId === NEW_STUDENT_ID && (
              <StudentCardEdit student={{ _id: NEW_STUDENT_ID, name: "", batch: newStudentBatch, email: "", username: "" }} onSave={handleSaveStudent} onCancel={handleCancelEdit} />
          )}

          {Object.keys(studentsByBatch).sort().map(batch => (
            <Box key={batch} className="my-6">
              <Typography variant="h5" className="border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">Batch: {batch}</Typography>
              {studentsByBatch[batch].map((student: any) => (
                editingStudentId === student._id ? (
                  <StudentCardEdit key={student._id} student={student} onSave={handleSaveStudent} onCancel={handleCancelEdit} />
                ) : (
                  <StudentCardView key={student._id} student={student} onEdit={() => setEditingStudentId(student._id)} onDelete={handleDeleteStudent} onRefetch={refetch} />
                )
              ))}
              {batch !== 'Uncategorized' && (
                  <Button startIcon={<AddIcon />} onClick={() => handleAddNewStudent(batch)}>Add Student to Batch {batch}</Button>
              )}
            </Box>
          ))}
        </>
      )}
    </div>
  );
};

export default StudentProvisioning;