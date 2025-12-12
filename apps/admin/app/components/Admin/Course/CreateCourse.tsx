"use client";
import React, { useState } from "react";
import CourseInformation from "./CourseInformation";
import CourseOptions from "./CourseOptions";
import CourseData from "./CourseData";
import CoursePreview from "./CoursePreview";
import { useCreateCourseMutation } from "../../../../redux/features/courses/coursesApi";
import { toast } from "react-hot-toast";
import { redirect } from "next/navigation";

const CreateCourse = () => {
  const [createCourse, { isLoading }] = useCreateCourseMutation();

  const [active, setActive] = useState(0);
  const [courseInfo, setCourseInfo] = useState({ name: "", description: "", price: "", estimatedPrice: "", thumbnail: "" });
  const [courseContent, setCourseContent] = useState({
    modules: [{ title: "", lessons: [{ title: "", videoUrl: "", resources: [] }], assignments: [], quizzes: [] }],
    finalAssignments: [],
    finalQuizzes: [],
  });
  const [courseData, setCourseData] = useState({});

  const handleSubmit = async () => {
    // This function combines all the data from different steps into one object.
    // The logic to clean IDs and filter empty items should be here.
    const formattedPrice = courseInfo.price === "" ? 0 : parseFloat(courseInfo.price);
    const formattedEstimatedPrice = courseInfo.estimatedPrice === "" ? 0 : parseFloat(courseInfo.estimatedPrice);
    
    // Example of cleaning logic (can be expanded)
    const cleanedContent = JSON.parse(JSON.stringify(courseContent));
    
    const data = {
      ...courseInfo,
      price: formattedPrice,
      estimatedPrice: formattedEstimatedPrice,
      ...cleanedContent,
    };
    setCourseData(data);
  };

  // THIS IS THE CRITICAL FIX
  const handleCourseCreate = async () => {
    const data = courseData;
    if (Object.keys(data).length === 0) {
      toast.error("Course data is empty. Please complete the form.");
      return;
    }

    try {
      // The `unwrap()` method will wait for the mutation to complete and will
      // either return the success payload or throw an error.
      await createCourse(data).unwrap();
      
      // Because `createCourse` has `invalidatesTags: ["Courses"]`, RTK Query automatically
      // starts refetching the `getAllCourses` query in the background *at this moment*.
      
      // Now that we know the mutation was successful, show the toast and navigate.
      toast.success("Course created successfully!");
      redirect("/admin/courses");

    } catch (error: any) {
      // If `unwrap()` throws an error, we catch it here.
      if (error.data) {
        toast.error(error.data.message);
      } else {
        toast.error("An unknown error occurred while creating the course.");
      }
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