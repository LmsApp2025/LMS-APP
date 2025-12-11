// In: apps/admin/app/components/Admin/AdminLayout.tsx (NEW FILE)

import React from "react";
import AdminSidebar from "./sidebar/AdminSidebar";
import DashboardHeader from "./DashboardHeader";
import Heading from "@/app/utils/Heading";
import AdminProtected from "@/app/hooks/adminProtected";

type AdminLayoutProps = {
    children: React.ReactNode;
    pageTitle: string;
    pageDescription?: string;
    keywords?: string;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
    children, 
    pageTitle,
    pageDescription = "MarsTech LMS is a platform for students to learn and get help from teachers",
    keywords = "Programming, MERN, Redux, Machine Learning" 
}) => {
    return (
        <AdminProtected>
            <Heading
                title={pageTitle}
                description={pageDescription}
                keywords={keywords}
            />
            <div className="flex min-h-screen">
                <div className="1500px:w-[16%] w-1/5">
                    <AdminSidebar />
                </div>
                <div className="w-[85%]">
                    <DashboardHeader />
                    {children}
                </div>
            </div>
        </AdminProtected>
    );
};

export default AdminLayout;