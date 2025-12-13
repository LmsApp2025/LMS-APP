import { apiSlice } from "../api/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllAdmins: builder.query({
      query: () => "get-admins",
      providesTags: ["Users"],
    }),
    
    // --- STUDENT ENDPOINTS ---
    getAllStudents: builder.query({
      query: () => "admin/students", 
      providesTags: ["Students"],
    }),
    adminCreateStudent: builder.mutation({
      query: (data) => ({
        url: `admin/create-student`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ["Students"],
    }),
    adminUpdateStudent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `admin/update-student/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Students', id }],
    }),
    adminDeleteStudent: builder.mutation({
      query: (id) => ({
        url: `admin/user/${id}`, // Note: using the general delete user route
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