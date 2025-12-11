'use client';
import React from 'react';
import AdminLayout from '../../../components/Admin/AdminLayout';
import EditCourse from "../../../components/Admin/Course/EditCourse";

type Props = { params: { id: string } };

const Page = ({ params }: Props) => {
  return (
    <AdminLayout pageTitle="Edit Course">
        <EditCourse id={params.id} />
    </AdminLayout>
  );
};

export default Page;