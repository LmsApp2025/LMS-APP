// In: apps/admin/app/components/Admin/Course/CourseData.tsx (FINAL COMPLETE VERSION)

import React, { FC } from "react";
import { Button, Box, Typography } from "@mui/material";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { toast } from "react-hot-toast";
import { produce } from 'immer';
import ModuleForm from "./forms/ModuleForm";
import AssignmentForm from "./forms/AssignmentForm";
import QuizEditor from "./forms/QuizEditor";
import { styles } from "@/app/styles/style";

type Props = { 
  courseContent: any; 
  setCourseContent: (c: any) => void; 
  active: number; 
  setActive: (a: number) => void; 
  handleSubmit: any; 
};

const newOption = () => ({ optionText: "" });
const newQuestion = () => ({ questionText: "", options: [newOption(), newOption()], correctAnswer: "" });
const newQuiz = () => ({ title: "New Quiz", questions: [newQuestion()] });
const newLesson = () => ({ title: "", videoUrl: "", resources: [], quizzes: [] });
const newModule = () => ({ title: "", lessons: [newLesson()], assignments: [], quizzes: [] });

const CourseData: FC<Props> = ({ courseContent, setCourseContent, active, setActive, handleSubmit: handleCourseSubmit }) => {

    const setContent = (producer: (draft: any) => void) => setCourseContent(produce(courseContent, producer));

    // --- GENERIC PATH FINDER ---
    const findNode = (draft: any, path: any) => {
        if (path.moduleIndex !== undefined && path.lessonIndex !== undefined) return draft.modules[path.moduleIndex].lessons[path.lessonIndex];
        if (path.moduleIndex !== undefined) return draft.modules[path.moduleIndex];
        return draft; // Root
    };

    // --- MODULES / LESSONS / RESOURCES ---
    const addModule = () => setContent(draft => { draft.modules.push(newModule()); });
    const removeModule = (mIndex: number) => setContent(draft => { if (draft.modules.length > 1) draft.modules.splice(mIndex, 1); });
    const handleModuleChange = (mIndex: number, field: string, value: any) => setContent(draft => { draft.modules[mIndex][field] = value; });

    const addLesson = (mIndex: number) => setContent(draft => { draft.modules[mIndex].lessons.push(newLesson()); });
    const removeLesson = (mIndex: number, lIndex: number) => setContent(draft => { if (draft.modules[mIndex].lessons.length > 1) draft.modules[mIndex].lessons.splice(lIndex, 1); });
    const handleLessonChange = (mIndex: number, lIndex: number, name: string, value: any) => setContent(draft => { draft.modules[mIndex].lessons[lIndex][name] = value; });

    const addResource = (mIndex: number, lIndex: number) => setContent(draft => { draft.modules[mIndex].lessons[lIndex].resources.push({ title: "", file: "" }); });
    const removeResource = (mIndex: number, lIndex: number, rIndex: number) => setContent(draft => { draft.modules[mIndex].lessons[lIndex].resources.splice(rIndex, 1); });
    const handleResourceChange = (mIndex: number, lIndex: number, rIndex: number, name: string, value: any) => setContent(draft => { draft.modules[mIndex].lessons[lIndex].resources[rIndex][name] = value; });

    // --- QUIZZES (Fully Implemented) ---
    const addQuiz = (path: any) => setContent(draft => { const node = findNode(draft, path); if (!node.quizzes) node.quizzes = []; node.quizzes.push(newQuiz()); });
    const removeQuiz = (path: any) => setContent(draft => { const node = findNode(draft, path); node.quizzes.splice(path.quizIndex, 1); });
    const addQuestion = (path: any) => setContent(draft => { const node = findNode(draft, path); node.quizzes[path.quizIndex].questions.push(newQuestion()); });
    const removeQuestion = (path: any) => setContent(draft => { const node = findNode(draft, path); node.quizzes[path.quizIndex].questions.splice(path.questionIndex, 1); });
    const addOption = (path: any) => setContent(draft => { const node = findNode(draft, path); node.quizzes[path.quizIndex].questions[path.questionIndex].options.push(newOption()); });
    const removeOption = (path: any) => setContent(draft => { const node = findNode(draft, path); node.quizzes[path.quizIndex].questions[path.questionIndex].options.splice(path.optionIndex, 1); });
    const onQuizChange = (path: any, field: string, value: any) => setContent(draft => {
        const node = findNode(draft, path);
        let target = node.quizzes[path.quizIndex];
        if (path.questionIndex !== undefined) target = target.questions[path.questionIndex];
        if (path.optionIndex !== undefined) target = target.options[path.optionIndex];
        target[field] = value;
    });

    // --- FILE HANDLING & NAVIGATION ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, mIndex: number, lIndex: number, rIndex: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setContent(draft => { draft.modules[mIndex].lessons[lIndex].resources[rIndex].file = reader.result as string; });
            reader.readAsDataURL(file);
        }
    };
    const handleResourceFileDelete = () => toast.error("File deletion from MinIO is handled in Edit Mode.");
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
                    addQuiz={addQuiz} removeQuiz={removeQuiz} addQuestion={addQuestion} removeQuestion={removeQuestion}
                    addOption={addOption} removeOption={removeOption} onQuizChange={onQuizChange}
                />
            ))}
            <Button startIcon={<AiOutlinePlusCircle />} onClick={addModule} sx={{ fontSize: '16px', mt: 2 }}>Add Module</Button>

            <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                <AssignmentForm title="Final Course Assignments" assignments={courseContent.finalAssignments || []} setAssignments={(a:any) => setContent(draft => {draft.finalAssignments = a})} />
            </Box>
            <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                <QuizEditor quizzes={courseContent.finalQuizzes || []} 
                    addQuiz={() => addQuiz({})} removeQuiz={(qi:any) => removeQuiz({quizIndex: qi})}
                    addQuestion={(qi:any) => addQuestion({quizIndex: qi})} removeQuestion={(qi:any, qsi:any) => removeQuestion({quizIndex: qi, questionIndex: qsi})}
                    addOption={(qi:any, qsi:any) => addOption({quizIndex: qi, questionIndex: qsi})} removeOption={(qi:any, qsi:any, oi:any) => removeOption({quizIndex: qi, questionIndex: qsi, optionIndex: oi})}
                    onQuizChange={(qi:any, f:any, v:any) => onQuizChange({quizIndex: qi}, f, v)}
                    onQuestionChange={(qi:any, qsi:any, f:any, v:any) => onQuizChange({quizIndex: qi, questionIndex: qsi}, f, v)}
                    onOptionChange={(qi:any, qsi:any, oi:any, v:any) => onQuizChange({quizIndex: qi, questionIndex: qsi, optionIndex: oi}, 'optionText', v)}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8 }}>
                <Button variant="contained" onClick={prevButton} sx={{ width: 180, height: 40, bgcolor: 'grey.600' }}>Prev</Button>
                <Button variant="contained" onClick={nextButton} sx={{ width: 180, height: 40, bgcolor: '#37a39a' }}>Next</Button>
            </Box>
        </Box>
    );
};

export default CourseData;