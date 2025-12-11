import { apiSlice } from "../api/apiSlice";

export const coursesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCourse: builder.mutation({
      query: (data) => ({
        url: "create-course",
        method: "POST",
        body: data,
      }),
      // FIXED: Added invalidatesTags. This tells RTK Query to automatically
      // refetch any query that provides the "Courses" tag after this mutation succeeds.
      invalidatesTags: ["Courses"],
    }),
    getAllCourses: builder.query({
      query: () => "get-admin-courses",
      // This provides the tag that the mutation will invalidate.
      providesTags: ["Courses"],
    }),
    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `delete-course/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses"],
    }),
    editCourse: builder.mutation({
      query: ({ id, data }) => ({
        url: `edit-course/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Courses"],
    }),
    // ... (rest of the endpoints remain the same)
    getUsersAllCourses: builder.query({ query: () => "get-courses" }),
    getCourseDetails: builder.query({ query: (id: any) => `get-course/${id}` }),
    getCourseContent: builder.query({ query: (id) => `get-course-content/${id}` }),
    addNewQuestion: builder.mutation({ query: (data) => ({ url: "add-question", method: "PUT", body: data }), invalidatesTags: ["Courses"] }),
    addAnswerInQuestion: builder.mutation({ query: (data) => ({ url: "add-answer", method: "PUT", body: data }), invalidatesTags: ["Courses"] }),
    addReviewInCourse: builder.mutation({ query: (data) => ({ url: `add-review/${data.id}`, method: "PUT", body: data }), invalidatesTags: ["Courses"] }),
    addReplyInReview: builder.mutation({ query: (data) => ({ url: `add-reply`, method: "PUT", body: data }), invalidatesTags: ["Courses"] }),
  }),
});

export const {
  useCreateCourseMutation,
  useGetAllCoursesQuery,
  useDeleteCourseMutation,
  useEditCourseMutation,
  useGetUsersAllCoursesQuery,
  useGetCourseDetailsQuery,
  useGetCourseContentQuery,
  useAddNewQuestionMutation,
  useAddAnswerInQuestionMutation,
  useAddReviewInCourseMutation,
  useAddReplyInReviewMutation
} = coursesApi;