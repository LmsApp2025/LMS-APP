// In packages/admin/app/Provider.tsx

"use client";
import React from "react";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import Loader from "./components/Loader/Loader";

export function Providers({ children }: { children: React.ReactNode }) {
  const { isLoading } = useLoadUserQuery({});
  return <>{isLoading ? <Loader /> : children}</>;
}
