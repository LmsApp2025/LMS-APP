"use client";
import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import EditFaq from "../../components/Admin/Customization/EditFaq";

const Page = () => {
  return (
    <AdminLayout pageTitle="Edit FAQ">
        <EditFaq />
    </AdminLayout>
  );
};

export default Page;