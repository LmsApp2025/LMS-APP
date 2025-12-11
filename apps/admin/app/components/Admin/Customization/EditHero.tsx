"use client";
import { useEditLayoutMutation, useGetHeroDataQuery } from "@/redux/features/layout/layoutApi";
import React, { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineCamera } from "react-icons/ai";
import Image from "next/image";
import Loader from "../../Loader/Loader";
import { Button } from "@mui/material";

const EditHero: FC = () => {
  const { data, isLoading, refetch } = useGetHeroDataQuery("Banner", { refetchOnMountOrArgChange: true });
  const [editLayout, { isSuccess, error }] = useEditLayoutMutation();

  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");

  useEffect(() => {
    if (data?.layout?.banner) {
      setTitle(data.layout.banner.title);
      setSubTitle(data.layout.banner.subTitle);
      setImage(data.layout.banner.image?.url);
    }
    if (isSuccess) {
      toast.success("Hero updated successfully!");
      refetch();
    }
    if (error) {
      // FIXED: Use a robust type guard to safely check the error structure.
      if (typeof error === 'object' && error !== null && 'data' in error && (error as any).data.message) {
        toast.error((error as any).data.message);
      } else {
        toast.error("An unexpected error occurred while updating hero section.");
      }
    }
  }, [data, isSuccess, error, refetch]);

  const handleUpdateImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isUnchanged =
    data?.layout?.banner?.title === title &&
    data?.layout?.banner?.subTitle === subTitle &&
    data?.layout?.banner?.image?.url === image;

  const handleEdit = async () => {
    if (!isUnchanged) {
      await editLayout({ type: "Banner", image, title, subTitle });
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="w-full 1000px:flex items-center relative min-h-screen">
      <div className="absolute top-[100px] 1000px:top-[unset] 1500px:h-[700px] 1500px:w-[700px] 1100px:h-[500px] 1100px:w-[500px] h-[50vh] w-[50vh] hero_animation rounded-full" />
      <div className="1000px:w-[40%] flex 1000px:min-h-screen items-center justify-end pt-[70px] 1000px:pt-[0] z-10">
        <div className="relative">
          <Image src={image || ''} width={400} height={400} alt="Hero Banner" className="object-contain 1100px:max-w-[90%] w-[90%] 1500px:max-w-[85%] h-auto z-10" />
          <input type="file" id="banner" accept="image/*" onChange={handleUpdateImage} className="hidden" />
          <label htmlFor="banner" className="absolute bottom-0 right-0 z-20"><AiOutlineCamera className="dark:text-white text-black text-[18px] cursor-pointer" /></label>
        </div>
      </div>
      <div className="1000px:w-[60%] flex flex-col items-center 1000px:mt-[0px] text-center 1000px:text-left mt-[150px]">
        <textarea className="dark:text-white resize-none text-[#000000c7] text-[30px] px-3 w-full 1000px:text-[60px] font-[600] font-Josefin py-2 1000px:leading-[75px] outline-none bg-transparent block" placeholder="Improve Your Online Learning..." value={title} onChange={(e) => setTitle(e.target.value)} rows={4} />
        <textarea value={subTitle} onChange={(e) => setSubTitle(e.target.value)} placeholder="We have 40k+ Online courses..." className="dark:text-[#edfff4] text-[#000000ac] font-Josefin font-[600] text-[18px] w-[90%] bg-transparent outline-none resize-none" />
      </div>
      <Button variant="contained" onClick={handleEdit} disabled={isUnchanged || isLoading} sx={{ position: 'absolute', bottom: '50px', right: '50px', backgroundColor: !isUnchanged ? '#42d383' : 'grey.500' }}>Save</Button>
    </div>
  );
};

export default EditHero;