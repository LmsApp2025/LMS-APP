"use client";
import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import StudentProvisioning from "../../components/Admin/Users/StudentProvisioning";

const Page = () => {
  return (
    <AdminLayout pageTitle="Student Provisioning">
        <StudentProvisioning />
    </AdminLayout>
  );
};
export default Page;