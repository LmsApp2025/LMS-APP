"use client";
import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import BannerManager from "@/app/components/Admin/Customization/BannerManager";

const Page = () => {
  return (
    <AdminLayout pageTitle="Manage Banners">
        <BannerManager />
    </AdminLayout>
  );
};

export default Page;