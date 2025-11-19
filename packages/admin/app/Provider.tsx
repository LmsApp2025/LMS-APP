// In packages/admin/app/Provider.tsx

"use client";
import React, { FC, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "../redux/features/store";
import { SessionProvider } from "next-auth/react";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import Loader from "./components/Loader/Loader";
import { setupListeners } from "@reduxjs/toolkit/query"; // <-- IMPORT THIS

const AppStateProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  // useLoadUserQuery now correctly handles the initial loading state.
  const { isLoading } = useLoadUserQuery({});
  
  // This is the critical fix for the admin panel
  useEffect(() => {
    // This function sets up listeners that will automatically refetch data
    // on events like refocusing the browser window.
    const unsubscribe = setupListeners(store.dispatch);
    return unsubscribe; // Cleanup the listeners when the component unmounts
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return <>{children}</>;
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
        
            <AppStateProvider>{children}</AppStateProvider>
    </Provider>
  );
}
