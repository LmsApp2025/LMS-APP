'use client';
import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import AllUsers from "../../components/Admin/Users/AllUsers";

const Page = () => {
  return (
    <AdminLayout pageTitle="Manage Admins">
        <AllUsers isTeam={true} />
    </AdminLayout>
  );
};

export default Page;