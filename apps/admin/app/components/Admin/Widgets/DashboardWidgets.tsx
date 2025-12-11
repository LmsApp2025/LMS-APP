// In: apps/admin/app/components/Admin/Widgets/DashboardWidgets.tsx (REFACTORED)

import React, { FC } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { BiBorderLeft } from "react-icons/bi";
import { PiUsersFourLight } from "react-icons/pi";
import UserAnalytics from "../Analytics/UserAnalytics";
import OrdersAnalytics from "../Analytics/OrdersAnalytics";
import AllInvoices from "../Order/AllInvoices";
import { useGetOrdersAnalyticsQuery, useGetUsersAnalyticsQuery } from "@/redux/features/analytics/analyticsApi";
import { getComparisonData } from "@/app/utils/ComparisonUtils";

const StatCard = ({ title, value, percent, icon: Icon }: any) => (
    <Box className="w-full dark:bg-[#111C43] rounded-sm shadow p-5 flex justify-between items-center">
        <Box>
            <Icon className="dark:text-[#45CBA0] text-black text-[30px]" />
            <Typography variant="h5" sx={{ pt: 2 }}>{value}</Typography>
            <Typography color="#45CBA0">{title}</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
            <CircularProgress variant="determinate" value={percent > 0 ? 100 : 0} size={45} color={percent > 0 ? "info" : "error"} />
            <Typography sx={{ pt: 1 }}>{percent > 0 ? "+" : ""}{percent.toFixed(2)}%</Typography>
        </Box>
    </Box>
);

const DashboardWidgets = () => {
  const { data: userData } = useGetUsersAnalyticsQuery({});
  const { data: orderData } = useGetOrdersAnalyticsQuery({});

  const userStats = getComparisonData(userData?.users);
  const orderStats = getComparisonData(orderData?.orders);

  return (
    <Box className="mt-[30px] min-h-screen">
      <div className="grid grid-cols-[75%,25%]">
        <div className="p-8"><UserAnalytics isDashboard={true} /></div>
        <Box className="pt-[80px] pr-8 flex flex-col gap-8">
            {orderStats && <StatCard title="Sales Obtained" value={orderStats.current} percent={orderStats.percent} icon={BiBorderLeft} />}
            {userStats && <StatCard title="New Users" value={userStats.current} percent={userStats.percent} icon={PiUsersFourLight} />}
        </Box>
      </div>
      <div className="grid grid-cols-[65%,35%] mt-[-20px]">
        <div className="dark:bg-[#111c43] w-[94%] mt-[30px] h-[40vh] shadow-sm m-auto"><OrdersAnalytics isDashboard={true} /></div>
        <div className="p-5"><Typography variant="h5" sx={{ pb: 3 }}>Recent Transactions</Typography><AllInvoices isDashboard={true} /></div>
      </div>
    </Box>
  );
};
export default DashboardWidgets;