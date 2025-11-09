// C:\LMS App copy Part 2\Lms-App - Copy\admin\redux\features\api\apiSlice.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../auth/authSlice";
import Cookies from "js-cookie";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_SERVER_URI,
    prepareHeaders: (headers, { getState }) => {
      const accessToken = Cookies.get("accessToken");
      const refreshToken = Cookies.get("refreshToken");

      if (accessToken) {
        headers.set("access-token", accessToken);
      }
      if (refreshToken) {
        headers.set("refresh-token", refreshToken);
      }

      // Add the ngrok header to bypass the warning page in development if needed
      // Note: This won't affect production deployments to Vercel/Railway.
      headers.set("ngrok-skip-browser-warning", "true");

      return headers;
    },
  }),

  // Register all custom tags used for caching and re-fetching
  tagTypes: ["Users", "Courses", "Orders", "AssignmentSubmissions", "QuizSubmissions", "Students", "Banners"],
  
  endpoints: (builder) => ({
    // Endpoint for refreshing tokens (can be used manually if needed)
    refreshToken: builder.query({
      query: () => ({
        url: "refresh",
        method: "GET",
        credentials: "include" as const,
      }),
    }),
    
    // Endpoint for loading the current user's data if a token exists
    loadUser: builder.query({
      query: () => "me", // Simple string endpoint for a GET request
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          // When the query succeeds, dispatch an action to log the user in
          // This populates the Redux store with the user's data
          dispatch(
            userLoggedIn({
              // Assuming your server sends back new tokens on a /me call
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
              user: result.data.user,
            })
          );
        } catch (error: any) {
          // This catch block is for logging and debugging purposes.
          // The component calling this query will handle the error state.
          console.log("Failed to load user:", error);
        }
      },
    }),
  }),
});

// THE DEFINITIVE FIX: Export the lazy query hook for programmatic fetching,
// in addition to the standard hooks.
export const { 
    useRefreshTokenQuery, 
    useLoadUserQuery, 
    useLazyLoadUserQuery // This is now correctly exported.
} = apiSlice;
