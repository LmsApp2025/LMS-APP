import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { type BaseQueryFn } from "@reduxjs/toolkit/query"; 
import { userLoggedIn, userLoggedOut } from "../auth/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  credentials: "include" as const,
  prepareHeaders: (headers) => {
    headers.set("ngrok-skip-browser-warning", "true");
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
         return result;
    }
    const refreshResult = await baseQuery('/refresh', api, extraOptions);
    if (refreshResult.data) {
      api.dispatch(userLoggedIn(refreshResult.data as any));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(userLoggedOut());
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/'; 
      }
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  // FIXED: Added "Layout" and "Banners" to the list of known tag types.
  tagTypes: ["Users", "Courses", "Orders", "AssignmentSubmissions", "QuizSubmissions", "Students", "Banners", "Layout"],
  endpoints: (builder) => ({
    loadUser: builder.query({
      query: () => "me",
      extraOptions: { maxRetries: 0 },
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn(data as any));
        } catch (error) {
          // silent fail on initial load
        }
      },
    }),
  }),
});

export const { useLoadUserQuery, useLazyLoadUserQuery } = apiSlice;