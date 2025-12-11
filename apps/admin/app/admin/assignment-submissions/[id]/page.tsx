'use client';
import React from 'react';
import AdminLayout from '../../../components/Admin/AdminLayout';
import AssignmentSubmissions from '../../../components/Admin/Submissions/AssignmentSubmissions';

type Props = { params: { id: string } };

const Page = ({ params }: Props) => {
    return (
        <AdminLayout pageTitle="Assignment Submissions">
            <AssignmentSubmissions courseId={params.id} />
        </AdminLayout>
    );
};

export default Page;