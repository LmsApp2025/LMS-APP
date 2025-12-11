'use client';
import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import AllInvoices from "../../components/Admin/Order/AllInvoices";

const Page = () => {
  return (
    <AdminLayout pageTitle="All Invoices">
       <AllInvoices />
    </AdminLayout>
  );
};

export default Page;