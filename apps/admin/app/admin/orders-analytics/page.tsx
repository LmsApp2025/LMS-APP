'use client';
import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import OrdersAnalytics from "../../components/Admin/Analytics/OrdersAnalytics";

const Page = () => {
  return (
    <AdminLayout pageTitle="Orders Analytics">
       <OrdersAnalytics />
    </AdminLayout>
  );
};

export default Page;