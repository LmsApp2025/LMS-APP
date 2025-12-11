import { styles } from "@/app/styles/style";
import CoursePlayer from "@/app/utils/CoursePlayer";
import Link from "next/link";
import React, { FC, useEffect, useState } from "react";
import { IoCheckmarkDoneOutline, IoCloseOutline } from "react-icons/io5";
import CourseContentList from "./CourseContentList";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import ReviewSection from "./ReviewSection";
import { Elements } from "@stripe/react-stripe-js";
import Ratings from "@/app/utils/Ratings";

type Props = {
  data: any;
  stripePromise: any;
  clientSecret: string;
  setRoute: (route: string) => void;
  setOpen: (open: boolean) => void;
};

const CourseDetails: FC<Props> = ({ data, stripePromise, clientSecret, setRoute, setOpen: openAuthModal }) => {
  const { data: userData, refetch } = useLoadUserQuery(undefined, {});
  const [user, setUser] = useState<any>();
  const [open, setOpen] = useState(false);

  useEffect(() => { setUser(userData?.user); }, [userData]);

  const dicountPercentenge = ((data?.estimatedPrice - data.price) / data?.estimatedPrice) * 100;
  const discountPercentengePrice = isNaN(dicountPercentenge) ? 0 : dicountPercentenge.toFixed(0);

  const isPurchased = user && user?.courses?.find((item: any) => item._id === data._id);

  const handleOrder = () => {
    if (user) { setOpen(true); } else { setRoute("Login"); openAuthModal(true); }
  };

  return (
    <div>
      <div className="w-[90%] 800px:w-[90%] m-auto py-5">
        <div className="w-full flex flex-col-reverse 800px:flex-row">
          <div className="w-full 800px:w-[65%] 800px:pr-5">
            <h1 className="text-[25px] font-Poppins font-[600] text-black dark:text-white">{data.name}</h1>
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center">
                <Ratings rating={data.ratings} />
                <h5 className="text-black dark:text-white ml-2">{data.reviews?.length} Reviews</h5>
              </div>
              <h5 className="text-black dark:text-white">{data.purchased} Students</h5>
            </div>
            <br />
            <h1 className="text-[25px] font-Poppins font-[600] text-black dark:text-white">Course Overview</h1>
            <CourseContentList data={data?.courseData} isDemo={true} />
            <br /><br />
            <div className="w-full">
              <h1 className="text-[25px] font-Poppins font-[600] text-black dark:text-white">Course Details</h1>
              <p className="text-[18px] mt-[20px] whitespace-pre-line w-full overflow-hidden text-black dark:text-white">{data.description}</p>
            </div>
            <br /><br />
            <div className="w-full">
              {user && <ReviewSection course={data} user={user} courseRefetch={refetch} />}
            </div>
          </div>
          <div className="w-full 800px:w-[35%] relative">
            <div className="sticky top-[100px] left-0 z-50 w-full">
              <CoursePlayer videoUrl={data?.demoUrl} title={data?.title} />
              <div className="flex items-center mt-3">
                <h1 className="pt-5 text-[25px] text-black dark:text-white">{data.price === 0 ? "Free" : data.price + "$"}</h1>
                <h5 className="pl-3 text-[20px] mt-2 line-through opacity-80 text-black dark:text-white">{data.estimatedPrice}$</h5>
                <h4 className="pl-5 pt-4 text-[22px] text-black dark:text-white">{discountPercentengePrice}% Off</h4>
              </div>
              <div className="flex items-center">
                {isPurchased ? (
                  <Link className={`${styles.button} !w-[180px] my-3 font-Poppins cursor-pointer !bg-green-600`} href={`/course-access/${data._id}`}>Enter Course</Link>
                ) : (
                  <div className={`${styles.button} !w-[180px] my-3 font-Poppins cursor-pointer`} onClick={handleOrder}>Buy Now {data.price}$</div>
                )}
              </div>
              <br />
              <p className="pb-1 text-black dark:text-white">• Source code included</p>
              <p className="pb-1 text-black dark:text-white">• Full lifetime access</p>
              <p className="pb-3 800px:pb-1 text-black dark:text-white">• Premium support</p>
            </div>
          </div>
        </div>
      </div>
      <>
        {open && (
          <div className="w-full h-screen bg-[#00000036] fixed top-0 left-0 z-50 flex items-center justify-center">
            <div className="w-[500px] min-h-[500px] bg-white rounded-xl shadow p-3">
              <div className="w-full flex justify-end">
                <IoCloseOutline size={40} className="text-black cursor-pointer" onClick={() => setOpen(false)} />
              </div>
              <div className="w-full">
                {stripePromise && clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    {/* CheckOutForm would be rendered here in a real scenario */}
                  </Elements>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default CourseDetails;