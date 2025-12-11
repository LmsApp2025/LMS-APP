import React, { FC } from "react";
import { Box, Button, TextField, IconButton, Typography } from "@mui/material";
import { AiOutlineDelete, AiOutlinePlusCircle } from "react-icons/ai";
import LessonForm from "./LessonForm";

type Props = {
  module: any;
  moduleIndex: number;
  handleModuleTitleChange: (moduleIndex: number, value: string) => void;
  removeModule: (moduleIndex: number) => void;
  addLesson: (moduleIndex: number) => void;
  // Explicitly define all props that need to be passed down to LessonForm
  removeLesson: (moduleIndex: number, lessonIndex: number) => void;
  handleLessonChange: (moduleIndex: number, lessonIndex: number, name: string, value: any) => void;
  handleResourceChange: (moduleIndex: number, lessonIndex: number, resourceIndex: number, name: string, value: any) => void;
  handleFileChange: (e: any, moduleIndex: number, lessonIndex: number, resourceIndex: number) => void;
  handleResourceFileDelete: (moduleIndex: number, lessonIndex: number, resourceIndex: number) => void;
  addResource: (moduleIndex: number, lessonIndex: number) => void;
  removeResource: (moduleIndex: number, lessonIndex: number, resourceIndex: number) => void;
};

const ModuleForm: FC<Props> = (props) => {
  const { module, moduleIndex, handleModuleTitleChange, removeModule, addLesson } = props;
  
  return (
    <Box className="w-full bg-[#cdc8c817] p-4 my-5 rounded-lg relative">
      <IconButton onClick={() => removeModule(moduleIndex)} sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
        <AiOutlineDelete color="red" size={24} />
      </IconButton>
      <TextField
        label={`Module ${moduleIndex + 1} Title`}
        value={module.title}
        onChange={(e) => handleModuleTitleChange(moduleIndex, e.target.value)}
        fullWidth
        variant="filled"
        sx={{ mb: 3 }}
      />

      {module.lessons.map((lesson: any, lessonIndex: number) => (
        <LessonForm
          key={lessonIndex}
          lesson={lesson}
          lessonIndex={lessonIndex}
          moduleIndex={moduleIndex}
          // FIXED: Explicitly pass all the required props down to the LessonForm
          removeLesson={props.removeLesson}
          handleLessonChange={props.handleLessonChange}
          handleResourceChange={props.handleResourceChange}
          handleFileChange={props.handleFileChange}
          handleResourceFileDelete={props.handleResourceFileDelete}
          addResource={props.addResource}
          removeResource={props.removeResource}
        />
      ))}
      <Button startIcon={<AiOutlinePlusCircle />} onClick={() => addLesson(moduleIndex)} sx={{ mt: 2 }}>
        Add Lesson
      </Button>
    </Box>
  );
};

export default ModuleForm;