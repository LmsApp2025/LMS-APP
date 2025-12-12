// In: apps/admin/app/components/Admin/Course/CreateCourse.tsx (FINAL CORRECTED VERSION)

"use client";
import React, { useState, useEffect } from "react";
import CourseInformation from "./CourseInformation";
import CourseOptions from "./CourseOptions";
import CourseData from "./CourseData";
import CoursePreview from "./CoursePreview";
import { useCreateCourseMutation } from "../../../../redux/features/courses/coursesApi";
import { toast } from "react-hot-toast";
import { redirect } from "next/navigation";

const CreateCourse = () => {
  const [createCourse, { isLoading, isSuccess, error }] = useCreateCourseMutation();

  useEffect(() => {
    if (isSuccess) {
      toast.success("Course created successfully!");
      redirect("/admin/courses");
    }
    if (error) {
      if (typeof error === 'object' && error !== null && 'data' in error) {
        toast.error((error as any).data.message);
      } else {
        toast.error("An unknown error occurred while creating the course.");
      }
    }
  }, [isSuccess, error]);

  const [active, setActive] = useState(0);
  const [courseInfo, setCourseInfo] = useState({ name: "", description: "", price: "", estimatedPrice: "", thumbnail: "" });
  const [courseContent, setCourseContent] = useState({
    modules: [{ title: "", lessons: [{ title: "", videoUrl: "", resources: [] }], assignments: [], quizzes: [] }],
    finalAssignments: [],
    finalQuizzes: [],
  });
  const [courseData, setCourseData] = useState({});

  const handleSubmit = () => {
    const formattedPrice = courseInfo.price === "" ? 0 : parseFloat(courseInfo.price);
    const formattedEstimatedPrice = courseInfo.estimatedPrice === "" ? 0 : parseFloat(courseInfo.estimatedPrice);
    const data = { ...courseInfo, price: formattedPrice, estimatedPrice: formattedEstimatedPrice, ...courseContent };
    setCourseData(data);
  };

  const handleCourseCreate = async () => {
    if (Object.keys(courseData).length > 0) {
      await createCourse(courseData);
    }
  };

  return (
    <div className="w-full flex min-h-screen">
      <div className="w-[80%]">
        {active === 0 && (<CourseInformation courseInfo={courseInfo} setCourseInfo={setCourseInfo} active={active} setActive={setActive} />)}
        {active === 1 && (<CourseData courseContent={courseContent} setCourseContent={setCourseContent} active={active} setActive={setActive} handleSubmit={handleSubmit} />)}
        {active === 2 && (<CoursePreview active={active} setActive={setActive} courseData={courseData} handleCourseCreate={handleCourseCreate} isEdit={false} />)}
      </div>
      <div className="w-[20%] mt-[100px] h-screen fixed z-[-1] top-18 right-0">
        <CourseOptions active={active} setActive={setActive} />
      </div>
    </div>
  );
};

export default CreateCourse;