'use client';
import React from 'react';
import AdminLayout from '../../../components/Admin/AdminLayout';
import CourseEnrollments from "../../../components/Admin/Course/CourseEnrollments";

type Props = { params: { id: string } };

const Page = ({ params }: Props) => {
  return (
    <AdminLayout pageTitle="Course Enrollments">
        <CourseEnrollments courseId={params.id} />
    </AdminLayout>
  );
};

export default Page;