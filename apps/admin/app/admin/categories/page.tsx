"use client";
import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import EditCategories from "../../components/Admin/Customization/EditCategories";

const Page = () => {
  return (
    <AdminLayout pageTitle="Edit Categories">
        <EditCategories />
    </AdminLayout>
  );
};

export default Page;