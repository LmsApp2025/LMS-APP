// In: packages/admin/redux/features/api/apiSlice.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { type BaseQueryFn } from "@reduxjs/toolkit/query"; 
import { userLoggedIn, userLoggedOut } from "../auth/authSlice";
//import { userLoggedIn } from "../auth/authSlice";
//import Cookies from "js-cookie";

// 1. Define the original baseQuery
const baseQuery = fetchBaseQuery({
  //baseUrl: '', 
  baseUrl: '/api/v1',
  credentials: "include" as const,
  //prepareHeaders: (headers, { getState }) => {
  prepareHeaders: (headers) => {
    // const accessToken = Cookies.get("accessToken");
    // const refreshToken = Cookies.get("refreshToken");

    // if (accessToken) {
    //   headers.set("access-token", accessToken);
    // }
    // if (refreshToken) {
    //   headers.set("refresh-token", refreshToken);
    // }
    headers.set("ngrok-skip-browser-warning", "true");
    return headers;
  },
});

// 2. Create the wrapper to prepend the API prefix
// const baseQueryWithPrefix: BaseQueryFn = async (args, api, extraOptions) => {
//     const url = typeof args === 'string' ? args : args.url;
//     const newArgs = typeof args === 'string' 
//         ? `/api/v1/${url}` 
//         : { ...args, url: `/api/v1/${url}` };
//     return baseQuery(newArgs, api, extraOptions);
// };

// 2. Create the wrapper that handles token refreshing and automatic logout
const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Check if the access token expired (status 401)
  if (result.error && result.error.status === 401) {
    console.log("Access token expired. Attempting to refresh...");
    
    // Attempt to get a new access token from the /refresh endpoint
    const refreshResult = await baseQuery('/refresh', api, extraOptions);

    if (refreshResult.data) {
      console.log("Token refresh successful. Retrying original request...");
      // If refresh succeeds, update the Redux state with the new user/token data
      api.dispatch(userLoggedIn(refreshResult.data as any));
      
      // Retry the original request that failed, now with the new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      console.log("Token refresh failed. Logging out and redirecting.");
      // If the refresh token is also expired, log the user out
      api.dispatch(userLoggedOut());
      
      // Force a full page reload to the login screen
      // This is the most reliable way to clear all state and redirect.
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/'; 
      }
    }
  }

  return result;
};

// // 3. Define the apiSlice
// export const apiSlice = createApi({
//   reducerPath: "api",
//   baseQuery: baseQueryWithPrefix,
//   tagTypes: ["Users", "Courses", "Orders", "AssignmentSubmissions", "QuizSubmissions", "Students", "Banners"],
//   endpoints: (builder) => ({
//     refreshToken: builder.query({
//       query: () => ({
//         url: "refresh",
//         method: "GET",
//         //credentials: "include" as const,
//       }),
//     }),
//     loadUser: builder.query({
//       query: () => "me",
//       async onQueryStarted(arg, { queryFulfilled, dispatch }) {
//         try {
//           const result = await queryFulfilled;
//           dispatch(
//             userLoggedIn({
//               accessToken: result.data.accessToken,
//               refreshToken: result.data.refreshToken,
//               user: result.data.user,
//             })
//           );
//         } catch (error: any) {
//           console.log("Failed to load user:", error);
//         }
//       },
//     }),
//   }),
// });

// 3. Define the apiSlice using the new re-authentication wrapper
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth, // <-- Use the new powerful wrapper
  tagTypes: ["Users", "Courses", "Orders", "AssignmentSubmissions", "QuizSubmissions", "Students", "Banners"],
  endpoints: (builder) => ({
    loadUser: builder.query({
      query: () => "me",
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn(data as any));
        } catch (error) {
          // Allow silent failure on initial load if user is not logged in
          //console.log("Initial load user failed. Redirect will be handled by reauth wrapper.");
        }
      },
    }),
  }),
});

export const { 
    //useRefreshTokenQuery, 
    useLoadUserQuery, 
    useLazyLoadUserQuery
} = apiSlice;