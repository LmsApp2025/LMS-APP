'use client';
import React from 'react';
import AdminLayout from '../../../components/Admin/AdminLayout';
import QuizSubmissions from '../../../components/Admin/Submissions/QuizSubmissions';

type Props = { params: { id: string } };

const Page = ({ params }: Props) => {
  return (
    <AdminLayout pageTitle="Quiz Submissions">
       <QuizSubmissions courseId={params.id} />
    </AdminLayout>
  );
};

export default Page;