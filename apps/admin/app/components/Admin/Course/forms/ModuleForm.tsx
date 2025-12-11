// In: apps/admin/app/components/Admin/Course/forms/ModuleForm.tsx (FINAL CORRECTED VERSION)

import React, { FC } from "react";
import { Box, Button, TextField, IconButton } from "@mui/material";
import { AiOutlineDelete, AiOutlinePlusCircle } from "react-icons/ai";
import LessonForm from "./LessonForm";
import AssignmentForm from "./AssignmentForm";
import QuizEditor from "./QuizEditor";

// Explicitly define every prop
type Props = {
  module: any;
  moduleIndex: number;
  handleModuleChange: (moduleIndex: number, field: string, value: any) => void;
  removeModule: (moduleIndex: number) => void;
  addLesson: (moduleIndex: number) => void;
  removeLesson: (moduleIndex: number, lessonIndex: number) => void;
  handleLessonChange: (moduleIndex: number, lessonIndex: number, name: string, value: any) => void;
  addResource: (moduleIndex: number, lessonIndex: number) => void;
  removeResource: (moduleIndex: number, lessonIndex: number, resourceIndex: number) => void;
  handleResourceChange: (moduleIndex: number, lessonIndex: number, resourceIndex: number, name: string, value: any) => void;
  handleFileChange: (e: any, moduleIndex: number, lessonIndex: number, resourceIndex: number) => void;
  handleResourceFileDelete: (moduleIndex: number, lessonIndex: number, resourceIndex: number) => void;
  addQuiz: (path: any) => void;
  removeQuiz: (path: any) => void;
  addQuestion: (path: any) => void;
  removeQuestion: (path: any) => void;
  addOption: (path: any) => void;
  removeOption: (path: any) => void;
  onQuizChange: (path: any, field: string, value: any) => void;
};

const ModuleForm: FC<Props> = (props) => {
  const { module, moduleIndex, handleModuleChange, removeModule, addLesson } = props;

  const quizPath = { moduleIndex };
  const quizHandlers = {
    addQuiz: () => props.addQuiz(quizPath),
    removeQuiz: (quizIndex: number) => props.removeQuiz({ ...quizPath, quizIndex }),
    addQuestion: (quizIndex: number) => props.addQuestion({ ...quizPath, quizIndex }),
    removeQuestion: (quizIndex: number, questionIndex: number) => props.removeQuestion({ ...quizPath, quizIndex, questionIndex }),
    addOption: (quizIndex: number, questionIndex: number) => props.addOption({ ...quizPath, quizIndex, questionIndex }),
    removeOption: (quizIndex: number, questionIndex: number, optionIndex: number) => props.removeOption({ ...quizPath, quizIndex, questionIndex, optionIndex }),
    onQuizChange: (quizIndex: number, field: string, value: any) => props.onQuizChange({ ...quizPath, quizIndex }, field, value),
    onQuestionChange: (quizIndex: number, questionIndex: number, field: string, value: any) => props.onQuizChange({ ...quizPath, quizIndex, questionIndex }, field, value),
    onOptionChange: (quizIndex: number, questionIndex: number, optionIndex: number, value: string) => props.onQuizChange({ ...quizPath, quizIndex, questionIndex, optionIndex }, 'optionText', value),
  };

  return (
    <Box className="w-full bg-[#cdc8c817] p-4 my-5 rounded-lg relative">
      <IconButton onClick={() => removeModule(moduleIndex)} sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}><AiOutlineDelete color="red" size={24} /></IconButton>
      <TextField label={`Module ${moduleIndex + 1} Title`} value={module.title} onChange={(e) => handleModuleChange(moduleIndex, 'title', e.target.value)} fullWidth variant="filled" sx={{ mb: 3 }}/>

      {module.lessons.map((lesson: any, lessonIndex: number) => (
        <LessonForm
          key={lessonIndex}
          lesson={lesson}
          lessonIndex={lessonIndex}
          moduleIndex={moduleIndex}
          // FIXED: Explicitly pass every single prop down
          removeLesson={props.removeLesson}
          handleLessonChange={props.handleLessonChange}
          addResource={props.addResource}
          removeResource={props.removeResource}
          handleResourceChange={props.handleResourceChange}
          handleFileChange={props.handleFileChange}
          handleResourceFileDelete={props.handleResourceFileDelete}
          addQuiz={props.addQuiz}
          removeQuiz={props.removeQuiz}
          addQuestion={props.addQuestion}
          removeQuestion={props.removeQuestion}
          addOption={props.addOption}
          removeOption={props.removeOption}
          onQuizChange={props.onQuizChange}
        />
      ))}
      <Button startIcon={<AiOutlinePlusCircle />} onClick={() => addLesson(moduleIndex)} sx={{ mt: 2 }}>Add Lesson</Button>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
        <AssignmentForm title="Module-Level Assignments" assignments={module.assignments || []} setAssignments={(newAssignments: any) => handleModuleChange(moduleIndex, 'assignments', newAssignments)} />
      </Box>
      
      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
        <QuizEditor quizzes={module.quizzes || []} {...quizHandlers} />
      </Box>
    </Box>
  );
};

export default ModuleForm;