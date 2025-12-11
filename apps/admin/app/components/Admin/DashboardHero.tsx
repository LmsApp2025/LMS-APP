"use client";
import React from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardWidgets from "./Widgets/DashboardWidgets";

type Props = {
  isDashboard?: boolean;
};

const DashboardHero = ({ isDashboard }: Props) => {
  return (
    <div>
      <DashboardHeader />
      {isDashboard && (
        <DashboardWidgets />
      )}
    </div>
  );
};

export default DashboardHero;