"use client";
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authSlice from "./auth/authSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSlice,
  },
  devTools: false,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// call the load user function on every page load
const initializeApp = async () => {
  // This is the crucial check:
  // typeof window !== 'undefined' is a standard way to check if the code is running in a browser.
  // process.env.NODE_ENV !== 'production' is an extra check to ensure it only runs in development.
  // During a production build on Railway, both of these will be false.
  if (typeof window !== 'undefined') {
    await store.dispatch(
      apiSlice.endpoints.loadUser.initiate({}, { forceRefetch: true })
    );
  }
};

initializeApp();
