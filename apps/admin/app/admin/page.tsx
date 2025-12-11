"use client";
import React from "react";
import AdminLayout from "../components/Admin/AdminLayout";
import DashboardHero from "../components/Admin/DashboardHero";

const Page = () => {
  return (
    <AdminLayout pageTitle="MarsTech LMS - Admin Dashboard">
        <DashboardHero isDashboard={true} />
    </AdminLayout>
  );
};

export default Page;