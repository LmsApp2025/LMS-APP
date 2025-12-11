'use client';
import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import UserAnalytics from '../../components/Admin/Analytics/UserAnalytics';

const Page = () => {
  return (
    <AdminLayout pageTitle="Users Analytics">
       <UserAnalytics />
    </AdminLayout>
  );
};

export default Page;