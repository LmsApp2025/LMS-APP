"use client";
import { FC, useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, CircularProgress } from "@mui/material";
import { HomeOutlinedIcon, ArrowForwardIosIcon, ArrowBackIosIcon, PeopleOutlinedIcon, ReceiptOutlinedIcon, BarChartOutlinedIcon, MapOutlinedIcon, GroupsIcon, OndemandVideoIcon, VideoCallIcon, WebIcon, QuizIcon, WysiwygIcon, ManageHistoryIcon, ExitToAppIcon } from "./Icon";
import avatarDefault from "../../../../public/assests/avatar.png";
import { useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useLogOutMutation } from "@/redux/features/auth/authApi";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";

interface IItemProps { title: string; to: string; icon: JSX.Element; selected: string; setSelected: (title: string) => void; }

const Item: FC<IItemProps> = ({ title, to, icon, selected, setSelected }) => (
    <MenuItem active={selected === title} onClick={() => setSelected(title)} icon={icon} component={<Link href={to} />}>
        <Typography className="!text-[16px] !font-Poppins">{title}</Typography>
    </MenuItem>
);

// Configuration remains the same
const menuItems = [
    { type: 'item' as const, title: 'Dashboard', to: '/admin', icon: <HomeOutlinedIcon /> },
    { type: 'header' as const, title: 'Data' },
    { type: 'item' as const, title: 'Admins', to: '/admin/users', icon: <GroupsIcon /> },
    { type: 'item' as const, title: 'Invoices', to: '/admin/invoices', icon: <ReceiptOutlinedIcon /> },
    { type: 'header' as const, title: 'Content' },
    { type: 'item' as const, title: 'Create Course', to: '/admin/create-course', icon: <VideoCallIcon /> },
    { type: 'item' as const, title: 'Live Courses', to: '/admin/courses', icon: <OndemandVideoIcon /> },
    { type: 'header' as const, title: 'Customization' },
    { type: 'item' as const, title: 'Hero', to: '/admin/hero', icon: <WebIcon /> },
    { type: 'item' as const, title: 'FAQ', to: '/admin/faq', icon: <QuizIcon /> },
    { type: 'item' as const, title: 'Categories', to: '/admin/categories', icon: <WysiwygIcon /> },
    { type: 'item' as const, title: 'Banners', to: '/admin/banners', icon: <WebIcon /> },
    { type: 'header' as const, title: 'Controllers' },
    { type: 'item' as const, title: 'Manage Students', to: '/admin/team', icon: <PeopleOutlinedIcon /> },
    { type: 'header' as const, title: 'Analytics' },
    { type: 'item' as const, title: 'Courses Analytics', to: '/admin/courses-analytics', icon: <BarChartOutlinedIcon /> },
    { type: 'item' as const, title: 'Orders Analytics', to: '/admin/orders-analytics', icon: <MapOutlinedIcon /> },
    { type: 'item' as const, title: 'Users Analytics', to: '/admin/users-analytics', icon: <ManageHistoryIcon /> },
    { type: 'header' as const, title: 'Extras' },
];

const AdminSidebar = () => {
  const { user } = useSelector((state: any) => state.auth);
  const { isLoading: userLoading } = useLoadUserQuery(undefined, {});
  const [logout, { isSuccess }] = useLogOutMutation();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (isSuccess) { window.location.href = "/"; } }, [isSuccess]);
  
  const logoutHandler = async () => { await logout({}); };

  if (!mounted) return null;

  return (
    <Box sx={{ "& .pro-sidebar-inner": { background: `${theme === "dark" ? "#111C43 !important" : "#fff !important"}` }, "& .pro-icon-wrapper": { backgroundColor: "transparent !important" }, "& .pro-inner-item:hover": { color: "#868dfb !important" }, "& .pro-menu-item.active": { color: "#6870fa !important" }, "& .pro-inner-item": { padding: "5px 35px 5px 20px !important", opacity: 1 }, "& .pro-menu-item": { color: `${theme !== "dark" && "#000"}` } }}>
      <Sidebar collapsed={isCollapsed} style={{ position: "fixed", top: 0, left: 0, height: "100vh", width: isCollapsed ? "0%" : "16%" }}>
        <Menu>
          <MenuItem onClick={() => setIsCollapsed(!isCollapsed)} icon={isCollapsed ? <ArrowForwardIosIcon /> : undefined} style={{ margin: "10px 0 20px 0" }}>
            {!isCollapsed && (<Box display="flex" justifyContent="space-between" alignItems="center" ml="15px"><h3 className="text-[25px] font-Poppins uppercase dark:text-white text-black">MarsTech</h3><IconButton onClick={() => setIsCollapsed(!isCollapsed)}><ArrowBackIosIcon className="text-black dark:text-[#ffffffc1]" /></IconButton></Box>)}
          </MenuItem>
          {!isCollapsed && (<Box mb="25px">{userLoading ? <CircularProgress /> : (<Box textAlign="center"><Image alt="profile-user" width={100} height={100} src={user?.avatar ? user.avatar.url : avatarDefault} style={{ cursor: "pointer", borderRadius: "50%", border: "3px solid #5b6fe6", margin: 'auto' }} /><Typography variant="h4" sx={{ m: "10px 0 0 0" }} className="!text-[20px] text-black dark:text-[#ffffffc1]">{user?.name}</Typography><Typography variant="h6" className="!text-[20px] text-black dark:text-[#ffffffc1] capitalize">- {user?.role}</Typography></Box>)}</Box>)}
          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            {/* FIXED: Use a type check to render items and headers correctly */}
            {menuItems.map((item) => {
              if (item.type === 'item') {
                return <Item key={item.title} title={item.title} to={item.to} icon={item.icon} selected={selected} setSelected={setSelected} />;
              }
              return (
                <Typography key={item.title} variant="h6" sx={{ m: "15px 0 5px 20px" }} className="!text-[18px] text-black dark:text-[#ffffffc1] capitalize !font-[400]">
                  {!isCollapsed && item.title}
                </Typography>
              );
            })}
            <div onClick={logoutHandler}><Item title="Logout" to="/" icon={<ExitToAppIcon />} selected={selected} setSelected={setSelected} /></div>
          </Box>
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default AdminSidebar;