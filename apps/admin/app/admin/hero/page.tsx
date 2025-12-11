'use client';
import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import EditHero from "../../components/Admin/Customization/EditHero";

const Page = () => {
  return (
    <AdminLayout pageTitle="Edit Hero Section">
       <EditHero />
    </AdminLayout>
  );
};

export default Page;