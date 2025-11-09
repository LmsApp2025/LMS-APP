// In: packages/admin/redux/features/api/apiSlice.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { type BaseQueryFn } from "@reduxjs/toolkit/query"; 
import { userLoggedIn } from "../auth/authSlice";
import Cookies from "js-cookie";

// 1. Define the original baseQuery
const baseQuery = fetchBaseQuery({
  baseUrl: '', 
  prepareHeaders: (headers, { getState }) => {
    const accessToken = Cookies.get("accessToken");
    const refreshToken = Cookies.get("refreshToken");

    if (accessToken) {
      headers.set("access-token", accessToken);
    }
    if (refreshToken) {
      headers.set("refresh-token", refreshToken);
    }
    headers.set("ngrok-skip-browser-warning", "true");
    return headers;
  },
});

// 2. Create the wrapper to prepend the API prefix
const baseQueryWithPrefix: BaseQueryFn = async (args, api, extraOptions) => {
    const url = typeof args === 'string' ? args : args.url;
    const newArgs = typeof args === 'string' 
        ? `/api/v1/${url}` 
        : { ...args, url: `/api/v1/${url}` };
    return baseQuery(newArgs, api, extraOptions);
};

// 3. Define the apiSlice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithPrefix,
  tagTypes: ["Users", "Courses", "Orders", "AssignmentSubmissions", "QuizSubmissions", "Students", "Banners"],
  endpoints: (builder) => ({
    refreshToken: builder.query({
      query: () => ({
        url: "refresh",
        method: "GET",
        credentials: "include" as const,
      }),
    }),
    loadUser: builder.query({
      query: () => "me",
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
              user: result.data.user,
            })
          );
        } catch (error: any) {
          console.log("Failed to load user:", error);
        }
      },
    }),
  }),
});

export const { 
    useRefreshTokenQuery, 
    useLoadUserQuery, 
    useLazyLoadUserQuery
} = apiSlice;