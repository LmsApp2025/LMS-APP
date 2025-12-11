'use client';
import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import CourseAnalytics from "../../components/Admin/Analytics/CourseAnalytics";

const Page = () => {
  return (
    <AdminLayout pageTitle="Courses Analytics">
        <CourseAnalytics />
    </AdminLayout>
  );
};

export default Page;