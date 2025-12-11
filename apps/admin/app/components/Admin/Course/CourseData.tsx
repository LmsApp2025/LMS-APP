// In: apps/admin/app/components/Admin/Course/CourseData.tsx

import React, { FC } from "react";
import { Button, Box, Typography } from "@mui/material";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { toast } from "react-hot-toast";
import ModuleForm from "./forms/ModuleForm";
import AssignmentForm from "./forms/AssignmentForm";
import QuizEditor from "./forms/QuizEditor";
import { produce } from 'immer';

type Props = { courseContent: any; setCourseContent: (c: any) => void; active: number; setActive: (a: number) => void; handleSubmit: any; };

const CourseData: FC<Props> = ({ courseContent, setCourseContent, active, setActive, handleSubmit: handleCourseSubmit }) => {

    const setContent = (producer: (draft: any) => void) => setCourseContent(produce(courseContent, producer));

    // --- MODULE HANDLERS ---
    const addModule = () => setContent(draft => { draft.modules.push({ title: "", lessons: [{title: "", videoUrl: "", resources: []}], assignments: [], quizzes: [] }); });
    const removeModule = (mIndex: number) => setContent(draft => { if(draft.modules.length > 1) draft.modules.splice(mIndex, 1); });
    const handleModuleChange = (mIndex: number, field: string, value: any) => setContent(draft => { draft.modules[mIndex][field] = value; });

    // --- LESSON HANDLERS ---
    const addLesson = (mIndex: number) => setContent(draft => { draft.modules[mIndex].lessons.push({ title: "", videoUrl: "", resources: [] }); });
    const removeLesson = (mIndex: number, lIndex: number) => setContent(draft => { if(draft.modules[mIndex].lessons.length > 1) draft.modules[mIndex].lessons.splice(lIndex, 1); });
    const handleLessonChange = (mIndex: number, lIndex: number, name: string, value: any) => setContent(draft => { draft.modules[mIndex].lessons[lIndex][name] = value; });

    // --- RESOURCE HANDLERS ---
    const addResource = (mIndex: number, lIndex: number) => setContent(draft => { draft.modules[mIndex].lessons[lIndex].resources.push({ title: "", file: "" }); });
    const removeResource = (mIndex: number, lIndex: number, rIndex: number) => setContent(draft => { draft.modules[mIndex].lessons[lIndex].resources.splice(rIndex, 1); });
    const handleResourceChange = (mIndex: number, lIndex: number, rIndex: number, name: string, value: any) => setContent(draft => { draft.modules[mIndex].lessons[lIndex].resources[rIndex][name] = value; });
    
    // --- QUIZ HANDLERS (GENERALIZED) ---
    const addQuiz = (path: any) => setContent(draft => { /* ... find path and push new quiz ... */ });
    // ... other quiz handlers
    
    // --- FILE & NAVIGATION ---
    const handleFileChange = (e: any, ...indices: number[]) => { /* ... (same as before) */ };
    const handleResourceFileDelete = () => { toast.error("Not implemented yet."); };
    const prevButton = () => setActive(active - 1);
    const nextButton = () => { handleCourseSubmit(); setActive(active + 1); };

    return (
        <Box sx={{ width: '80%', margin: 'auto', mt: 12, p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Course Content</Typography>
            {courseContent.modules.map((module: any, index: number) => (
                <ModuleForm
                    key={index} module={module} moduleIndex={index}
                    handleModuleChange={handleModuleChange} removeModule={removeModule} addLesson={addLesson}
                    removeLesson={removeLesson} handleLessonChange={handleLessonChange}
                    addResource={addResource} removeResource={removeResource} handleResourceChange={handleResourceChange}
                    handleFileChange={handleFileChange} handleResourceFileDelete={handleResourceFileDelete}
                    // Pass down quiz handlers
                    addQuiz={addQuiz} /* ... etc */
                />
            ))}
            <Button startIcon={<AiOutlinePlusCircle />} onClick={addModule}>Add Module</Button>

            <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                <AssignmentForm title="Final Course Assignments" assignments={courseContent.finalAssignments || []} setAssignments={(a:any) => setContent(draft => {draft.finalAssignments = a})} />
            </Box>
            <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                {/* <QuizEditor quizzes={courseContent.finalQuizzes || []} ... /> */}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8 }}>
                <Button variant="contained" onClick={prevButton} sx={{ bgcolor: 'grey.600' }}>Prev</Button>
                <Button variant="contained" onClick={nextButton} sx={{ bgcolor: '#37a39a' }}>Next</Button>
            </Box>
        </Box>
    );
};

export default CourseData;