import { apiSlice } from "../api/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllAdmins: builder.query({
      query: () => "get-admins",
      providesTags: ["Users"],
    }),
    
    // --- STUDENT ENDPOINTS ---
    getAllStudents: builder.query({
      // FIXED: The query now points to the correct, plural "students" endpoint
      query: () => "admin/students", 
      providesTags: ["Students"],
    }),
    adminCreateStudent: builder.mutation({
      query: (data) => ({
        url: `admin/create-student`,
        method: 'POST',
        body: data,
      }),
      // FIXED: This is the crucial cache invalidation step.
      // After a student is created, it tells RTK Query to refetch the "Students" list.
      invalidatesTags: ["Students"],
    }),
    adminUpdateStudent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `admin/update-student/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Students"],
    }),
    adminDeleteStudent: builder.mutation({
      query: (id) => ({
        url: `admin/delete-user/${id}`, // Note: using the general delete user route
        method: 'DELETE',
      }),
      invalidatesTags: ["Students"],
    }),
    updateStudentEnrollment: builder.mutation({
      query: ({ userId, courseId }) => ({
        url: `admin/enrollment`,
        method: 'PUT',
        body: { userId, courseId }
      }),
      invalidatesTags: ["Students", "Courses"],
    }),
  }),
});

export const {
  useGetAllAdminsQuery,
  useGetAllStudentsQuery,
  useAdminCreateStudentMutation,
  useAdminUpdateStudentMutation,
  useAdminDeleteStudentMutation,
  useUpdateStudentEnrollmentMutation,
} = userApi;