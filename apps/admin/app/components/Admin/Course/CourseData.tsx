import { styles } from "@/app/styles/style";
import React, { FC } from "react";
import { Button, Box, Typography } from "@mui/material";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { toast } from "react-hot-toast";
import ModuleForm from "./forms/ModuleForm";

type Props = {
  courseContent: any;
  setCourseContent: (courseContent: any) => void;
  active: number;
  setActive: (active: number) => void;
  handleSubmit: any;
};

const CourseData: FC<Props> = ({ courseContent, setCourseContent, active, setActive, handleSubmit: handleCourseSubmit }) => {
    const setContent = (newContent: any) => {
        setCourseContent(newContent);
    };

    const addModule = () => {
        const lastModule = courseContent.modules[courseContent.modules.length - 1];
        if (lastModule && (lastModule.title === "" || lastModule.lessons[0].title === "")) {
            toast.error("Please fill out the previous module first.");
            return;
        }
        setContent({ ...courseContent, modules: [...courseContent.modules, { title: "", lessons: [{title: "", videoUrl: "", resources: []}], assignments: [], quizzes: [] }] });
    };

    const removeModule = (moduleIndex: number) => {
        if (courseContent.modules.length > 1) {
            const updatedModules = [...courseContent.modules];
            updatedModules.splice(moduleIndex, 1);
            setContent({ ...courseContent, modules: updatedModules });
        }
    };

    const addLesson = (moduleIndex: number) => {
        const updatedModules = [...courseContent.modules];
        updatedModules[moduleIndex].lessons.push({ title: "", videoUrl: "", resources: [] });
        setContent({ ...courseContent, modules: updatedModules });
    };

    const removeLesson = (moduleIndex: number, lessonIndex: number) => {
        if (courseContent.modules[moduleIndex].lessons.length > 1) {
            const updatedModules = [...courseContent.modules];
            updatedModules[moduleIndex].lessons.splice(lessonIndex, 1);
            setContent({ ...courseContent, modules: updatedModules });
        }
    };
    
    const handleLessonChange = (moduleIndex: number, lessonIndex: number, name: string, value: any) => {
        const updatedModules = [...courseContent.modules];
        updatedModules[moduleIndex].lessons[lessonIndex][name] = value;
        setContent({ ...courseContent, modules: updatedModules });
    };

    const addResource = (moduleIndex: number, lessonIndex: number) => {
        const updatedModules = [...courseContent.modules];
        updatedModules[moduleIndex].lessons[lessonIndex].resources.push({ title: "", file: "" });
        setContent({ ...courseContent, modules: updatedModules });
    };

    const removeResource = (moduleIndex: number, lessonIndex: number, resourceIndex: number) => {
        const updatedModules = [...courseContent.modules];
        updatedModules[moduleIndex].lessons[lessonIndex].resources.splice(resourceIndex, 1);
        setContent({ ...courseContent, modules: updatedModules });
    };

    const handleResourceChange = (moduleIndex: number, lessonIndex: number, resourceIndex: number, name: string, value: any) => {
        const updatedModules = [...courseContent.modules];
        updatedModules[moduleIndex].lessons[lessonIndex].resources[resourceIndex][name] = value;
        setContent({ ...courseContent, modules: updatedModules });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, moduleIndex: number, lessonIndex: number, resourceIndex: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                if (reader.readyState === 2) {
                    const updatedModules = [...courseContent.modules];
                    updatedModules[moduleIndex].lessons[lessonIndex].resources[resourceIndex].file = reader.result as string;
                    setContent({ ...courseContent, modules: updatedModules });
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleResourceFileDelete = () => { toast.error("File delete handler not implemented yet."); };

    const prevButton = () => setActive(active - 1);
    const nextButton = () => {
        handleCourseSubmit();
        setActive(active + 1);
    };

    return (
        <Box sx={{ width: '80%', margin: 'auto', mt: 12, p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Course Content</Typography>
            
            {courseContent.modules.map((module: any, index: number) => (
                <ModuleForm
                    key={index}
                    module={module}
                    moduleIndex={index}
                    // FIXED: Pass all required props
                    handleModuleTitleChange={(mIndex, value) => setContent({ ...courseContent, modules: courseContent.modules.map((m:any, i:number) => i === mIndex ? {...m, title: value} : m) })}
                    removeModule={removeModule}
                    addLesson={addLesson}
                    removeLesson={removeLesson}
                    handleLessonChange={handleLessonChange}
                    handleResourceChange={handleResourceChange}
                    handleFileChange={handleFileChange}
                    handleResourceFileDelete={handleResourceFileDelete}
                    addResource={addResource}
                    removeResource={removeResource}
                />
            ))}

            <Button startIcon={<AiOutlinePlusCircle />} onClick={addModule} sx={{ mt: 2, fontSize: '18px' }}>
                Add Another Module
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8 }}>
                <Button variant="contained" onClick={prevButton} sx={{ width: 180, height: 40, bgcolor: 'grey.600' }}>
                    Prev
                </Button>
                <Button variant="contained" onClick={nextButton} sx={{ width: 180, height: 40, bgcolor: '#37a39a' }}>
                    Next
                </Button>
            </Box>
        </Box>
    );
};

export default CourseData;