'use client';
import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import AllCourses from "../../components/Admin/Course/AllCourses";

const Page = () => {
  return (
    <AdminLayout pageTitle="All Courses">
        <AllCourses />
    </AdminLayout>
  );
};

export default Page;