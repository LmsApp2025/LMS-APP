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

// This is our robust middleware for handling automatic token refreshing.
const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Check if a request failed because the access token expired (status 401)
  if (result.error && result.error.status === 401) {
    // Don't try to refresh if we are already on the login page, as it could cause a loop.
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
         return result;
    }
    
    // Attempt to get a new access token from the '/refresh' endpoint
    const refreshResult = await baseQuery('/refresh', api, extraOptions);

    if (refreshResult.data) {
      // If the refresh was successful, update the user's session in Redux state.
      api.dispatch(userLoggedIn(refreshResult.data as any));
      // Retry the original request that failed. RTK Query will now use the new token.
      result = await baseQuery(args, api, extraOptions);
    } else {
      // If the refresh token is also invalid, log the user out.
      api.dispatch(userLoggedOut());
      // Redirect to the login page.
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/'; 
      }
    }
  }
  return result;
};

// This is the main API slice definition.
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  // This array defines all the "tags" that can be used for caching and invalidation.
  // It's crucial that any tag used in providesTags or invalidatesTags is listed here.
  tagTypes: ["Users", "Courses", "Orders", "AssignmentSubmissions", "QuizSubmissions", "Students", "Banners", "Layout"],
  endpoints: (builder) => ({
    // This query is used to load the user's session when the app starts.
    loadUser: builder.query({
      query: () => "me",
      providesTags: ["Users"], // The user data is tagged as "Users"
      extraOptions: { maxRetries: 0 },
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn(data as any));
        } catch (error) {
          // This can fail silently if the user is not logged in.
          // The baseQueryWithReauth will handle redirection if necessary on other pages.
        }
      },
    }),
  }),
});

export const { useLoadUserQuery, useLazyLoadUserQuery } = apiSlice;