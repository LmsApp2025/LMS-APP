'use client'
import React, { useEffect, useState } from "react";
import { Box, Button, IconButton } from "@mui/material";
import { AiOutlineDelete } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import { useDeleteCourseMutation, useGetAllCoursesQuery } from "@/redux/features/courses/coursesApi";
import Loader from "../../Loader/Loader";
import { format } from "timeago.js";
import { toast } from "react-hot-toast";
import Link from "next/link";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import StyledDataGrid from "../common/StyleDataGrid";
import DeleteConfirmationModal from "../common/DeleteConfirmationModal";

const AllCourses = () => {
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState("");
  const { isLoading, data, refetch } = useGetAllCoursesQuery({}, { refetchOnMountOrArgChange: true });
  const [deleteCourse, { isSuccess, error }] = useDeleteCourseMutation();

  useEffect(() => {
    if (isSuccess) {
      setOpen(false);
      refetch();
      toast.success("Course Deleted Successfully");
    }
    if (error) {
      if (typeof error === 'object' && error !== null && 'data' in error) {
        toast.error((error as any).data.message);
      }
    }
  }, [isSuccess, error, refetch]);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "title", headerName: "Course Title", flex: 1 },
    { field: "purchased", headerName: "Enrolled", flex: 0.3 },
    { field: "created_at", headerName: "Created At", flex: 0.3 },
    {
      field: "actions", headerName: "Actions", flex: 0.5,
      renderCell: (params: any) => (
        <Box>
          <Link href={`/admin/edit-course/${params.row.id}`} passHref><IconButton><FiEdit2 /></IconButton></Link>
          <Link href={`/admin/enrollments/${params.row.id}`} passHref><IconButton><ManageAccountsIcon /></IconButton></Link>
          <Link href={`/admin/assignment-submissions/${params.row.id}`} passHref><IconButton><AssignmentIcon /></IconButton></Link>
          <Link href={`/admin/quiz-submissions/${params.row.id}`} passHref><IconButton><QuizIcon /></IconButton></Link>
          <IconButton onClick={() => { setOpen(true); setCourseId(params.row.id); }}><AiOutlineDelete /></IconButton>
        </Box>
      ),
    },
  ];

  const rows: any = [];
  if (data?.courses) {
    data.courses.forEach((item: any) => {
      rows.push({
        id: item._id, title: item.name,
        purchased: item.purchased, created_at: format(item.createdAt),
      });
    });
  }

  const handleDelete = async () => {
    await deleteCourse(courseId);
  };

  return (
    <Box m="20px">
      {isLoading ? <Loader /> : <StyledDataGrid checkboxSelection rows={rows} columns={columns} />}
      <DeleteConfirmationModal open={open} onClose={() => setOpen(false)} onConfirm={handleDelete} itemName="this course" />
    </Box>
  );
};

export default AllCourses;