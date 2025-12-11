import { styles } from "@/app/styles/style";
import CoursePlayer from "@/app/utils/CoursePlayer";
import { useGetCourseDetailsQuery } from "@/redux/features/courses/coursesApi";
import React, { FC, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import CommentSection from "./CommentSection";
import ReviewSection from "./ReviewSection";
import { Box, Tab, Tabs, Typography } from "@mui/material";

type Props = {
  data: any;
  id: string;
  activeVideo: number;
  setActiveVideo: (activeVideo: number) => void;
  user: any;
  refetch: any;
};

const CourseContentMedia: FC<Props> = ({ data, id, activeVideo, setActiveVideo, user, refetch }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { data: courseData, refetch: courseRefetch } = useGetCourseDetailsQuery(id, { refetchOnMountOrArgChange: true });
  const course = courseData?.course;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <div className="w-[95%] 800px:w-[86%] py-4 m-auto">
      <CoursePlayer title={data[activeVideo]?.title} videoUrl={data[activeVideo]?.videoUrl} />
      <div className="w-full flex items-center justify-between my-3">
        <div className={`${styles.button} text-white !w-[unset] !min-h-[40px] !py-[unset] ${activeVideo === 0 && "!cursor-no-drop opacity-[.8]"}`} onClick={() => setActiveVideo(activeVideo === 0 ? 0 : activeVideo - 1)}>
          <AiOutlineArrowLeft className="mr-2" /> Prev Lesson
        </div>
        <div className={`${styles.button} !w-[unset] text-white !min-h-[40px] !py-[unset] ${data.length - 1 === activeVideo && "!cursor-no-drop opacity-[.8]"}`} onClick={() => setActiveVideo(data && data.length - 1 === activeVideo ? activeVideo : activeVideo + 1)}>
          Next Lesson <AiOutlineArrowRight className="ml-2" />
        </div>
      </div>
      <h1 className="pt-2 text-[25px] font-[600] dark:text-white text-black ">{data[activeVideo].title}</h1>
      <br />
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="course content tabs">
          <Tab label="Overview" />
          <Tab label="Resources" />
          <Tab label="Q&A" />
          <Tab label="Reviews" />
        </Tabs>
      </Box>
      <br />
      {activeTab === 0 && <p className="text-[18px] whitespace-pre-line mb-3 dark:text-white text-black">{data[activeVideo]?.description}</p>}
      {activeTab === 1 && (
        <div>{data[activeVideo]?.links.map((item: any, index: number) => (
            <div className="mb-5" key={index}><h2 className="800px:text-[20px] 800px:inline-block dark:text-white text-black">{item.title && item.title + " :"}</h2><a className="inline-block text-[#4395c4] 800px:text-[20px] 800px:pl-2" href={item.url}>{item.url}</a></div>
        ))}</div>
      )}
      {activeTab === 2 && <CommentSection data={data[activeVideo]} courseId={id} contentId={data[activeVideo]._id} refetch={refetch} user={user} />}
      {activeTab === 3 && course && <ReviewSection course={course} user={user} courseRefetch={courseRefetch} />}
    </div>
  );
};

export default CourseContentMedia;