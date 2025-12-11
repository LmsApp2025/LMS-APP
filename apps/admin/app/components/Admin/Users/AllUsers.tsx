"use client";
import React, { FC, useEffect, useState } from "react";
import { Box, Button, IconButton } from "@mui/material";
import { AiOutlineDelete, AiOutlineMail } from "react-icons/ai";
import Loader from "../../Loader/Loader";
import { format } from "timeago.js";
import { useGetAllAdminsQuery } from "@/redux/features/user/userApi";
import { toast } from "react-hot-toast";
import StyledDataGrid from "../common/StyleDataGrid";
import DeleteConfirmationModal from "../common/DeleteConfirmationModal";

type Props = { isTeam?: boolean; };

const AllUsers: FC<Props> = ({ isTeam }) => {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const { isLoading, data, refetch } = useGetAllAdminsQuery({}, { refetchOnMountOrArgChange: true });
  // const [deleteUser, { isSuccess: deleteSuccess, error: deleteError }] = useAdminDeleteUserMutation(); // Assuming this exists

  // useEffect(() => { ... handle delete success/error ... }, [deleteSuccess, deleteError]);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    { field: "name", headerName: "Name", flex: 0.5 },
    { field: "email", headerName: "Email", flex: 0.5 },
    { field: "role", headerName: "Role", flex: 0.3 },
    { field: "created_at", headerName: "Joined At", flex: 0.5 },
    {
      field: "actions", headerName: "Actions", flex: 0.2,
      renderCell: (params: any) => (
        <Box>
          <a href={`mailto:${params.row.email}`}><IconButton><AiOutlineMail /></IconButton></a>
          <IconButton onClick={() => { setOpen(true); setUserId(params.row.id); }}><AiOutlineDelete /></IconButton>
        </Box>
      ),
    },
  ];

  const rows: any = [];
  const usersToDisplay = isTeam ? data?.users.filter((item: any) => item.role === "admin") : data?.users;

  if(usersToDisplay) {
    usersToDisplay.forEach((item: any) => {
        rows.push({
          id: item._id, name: item.name, email: item.email, role: item.role, created_at: format(item.createdAt),
        });
      });
  }

  const handleDelete = async () => {
    toast.error("Admin delete functionality is not yet implemented.");
    setOpen(false);
  };

  return (
    <Box m="20px">
      {isLoading ? <Loader /> : <StyledDataGrid checkboxSelection rows={rows} columns={columns} />}
      <DeleteConfirmationModal open={open} onClose={() => setOpen(false)} onConfirm={handleDelete} itemName="this user" />
    </Box>
  );
};

export default AllUsers;