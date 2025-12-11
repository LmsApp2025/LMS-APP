'use client';
import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import CreateCourse from "../../components/Admin/Course/CreateCourse";

const Page = () => {
  return (
    <AdminLayout pageTitle="Create New Course">
        <CreateCourse /> 
    </AdminLayout>
  );
};

export default Page;