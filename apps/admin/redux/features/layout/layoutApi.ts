// In: apps/admin/redux/features/layout/layoutApi.ts (UPDATED)

import { apiSlice } from "../api/apiSlice";

export const layoutApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHeroData: builder.query({
      query: (type) => `get-layout/${type}`,
      providesTags: ["Layout"],
    }),
    editLayout: builder.mutation({
      query: (body) => ({
        url: `edit-layout`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Layout"],
    }),

    // --- NEW BANNER ENDPOINTS ---
    getBanners: builder.query<any, void>({
      query: () => `get-banners`,
      providesTags: ["Banners"],
    }),
    uploadBanner: builder.mutation<any, { image: string }>({
      query: ({ image }) => ({
        url: 'upload-banner',
        method: 'POST',
        body: { image },
      }),
      invalidatesTags: ["Banners"],
    }),
    deleteBanner: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `delete-banner/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Banners"],
    }),
  }),
});

export const {
  useGetHeroDataQuery,
  useEditLayoutMutation,
  useGetBannersQuery,
  useUploadBannerMutation,
  useDeleteBannerMutation,
} = layoutApi;