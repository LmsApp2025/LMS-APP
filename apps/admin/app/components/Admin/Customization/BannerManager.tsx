"use client";
import { styles } from "@/app/styles/style";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineDelete } from "react-icons/ai";
import Loader from "../../Loader/Loader";
import { useGetBannersQuery, useUploadBannerMutation, useDeleteBannerMutation } from "@/redux/features/layout/layoutApi";
// FIXED: Added missing import for Button from Material-UI
import { Button } from "@mui/material";

const BannerManager = () => {
  const { data, isLoading, refetch } = useGetBannersQuery(undefined, { refetchOnMountOrArgChange: true });
  const [uploadBanner, { isLoading: isUploading, isSuccess: uploadSuccess, error: uploadError }] = useUploadBannerMutation();
  const [deleteBanner, { isLoading: isDeleting, isSuccess: deleteSuccess, error: deleteError }] = useDeleteBannerMutation();
  const [newImage, setNewImage] = useState<string | null>(null);

  useEffect(() => {
    if (uploadSuccess) {
      toast.success("Image uploaded successfully!");
      setNewImage(null);
      refetch();
    }
    if (deleteSuccess) {
      toast.success("Image deleted successfully!");
      refetch();
    }
    const error = uploadError || deleteError;
    // FIXED: Use a robust type guard for the error object
    if (error) {
      if (typeof error === 'object' && error !== null && 'data' in error && (error as any).data.message) {
        toast.error((error as any).data.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  }, [uploadSuccess, deleteSuccess, uploadError, deleteError, refetch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setNewImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (newImage) { await uploadBanner({ image: newImage }); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure?")) { await deleteBanner({ id }); }
  };

  return (
    <div className="w-[90%] m-auto mt-24 p-4">
      <h1 className={`${styles.title}`}>Manage Banner Images</h1>
      
      <div className="my-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Upload New Banner</h2>
        <input type="file" accept="image/*" className={`${styles.input} !h-auto p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`} onChange={handleFileChange} />
        {newImage && (
            <div className="my-4 flex items-center gap-4">
                <img src={newImage} alt="Preview" className="w-48 h-24 object-cover rounded-lg"/>
                <Button variant="contained" disabled={isUploading} className={`${styles.button} !w-40`} onClick={handleUpload}>
                    {isUploading ? "Uploading..." : "Confirm Upload"}
                </Button>
            </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Current Banners</h2>
        {isLoading ? <Loader /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.bannerImages?.map((img: any) => (
                    <div key={img._id} className="relative group">
                        <img src={img.url} alt="Banner" className="w-full h-40 object-cover rounded-lg shadow-lg"/>
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button disabled={isDeleting} onClick={() => handleDelete(img._id)} className="p-3 bg-red-600 rounded-full text-white">
                                <AiOutlineDelete size={24} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default BannerManager;