import React, { FC } from "react";
import { Box, Button, TextField, IconButton, Typography } from "@mui/material";
import { AiOutlineDelete, AiOutlinePlusCircle } from "react-icons/ai";
import { IoIosVideocam } from "react-icons/io";
import { styles } from "@/app/styles/style";
import QuizEditor from "./QuizEditor";

type Props = {
  lesson: any;
  lessonIndex: number;
  moduleIndex: number;
  removeLesson: (moduleIndex: number, lessonIndex: number) => void;
  handleLessonChange: (moduleIndex: number, lessonIndex: number, name: string, value: any) => void;
  // Resource Handlers
  addResource: (moduleIndex: number, lessonIndex: number) => void;
  removeResource: (moduleIndex: number, lessonIndex: number, resourceIndex: number) => void;
  handleResourceChange: (moduleIndex: number, lessonIndex: number, resourceIndex: number, name: string, value: any) => void;
  handleFileChange: (e: any, moduleIndex: number, lessonIndex: number, resourceIndex: number) => void;
  handleResourceFileDelete: (moduleIndex: number, lessonIndex: number, resourceIndex: number) => void;
  // Quiz Handlers
  addQuiz: (path: any) => void;
  removeQuiz: (path: any) => void;
  addQuestion: (path: any) => void;
  removeQuestion: (path: any) => void;
  addOption: (path: any) => void;
  removeOption: (path: any) => void;
  onQuizChange: (path: any, field: string, value: any) => void;
};

const LessonForm: FC<Props> = (props) => {
  const { lesson, lessonIndex, moduleIndex, removeLesson, handleLessonChange, addResource, removeResource, handleResourceChange, handleFileChange, handleResourceFileDelete } = props;

  const quizPath = { moduleIndex, lessonIndex };
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
    <Box className="w-full bg-[#fdfdfd] dark:bg-slate-800/50 p-4 my-4 rounded-md relative border dark:border-gray-700">
      <IconButton onClick={() => removeLesson(moduleIndex, lessonIndex)} sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}><AiOutlineDelete color="red" /></IconButton>
      <Typography variant="h6" sx={{ mb: 2 }}>Lesson {lessonIndex + 1}</Typography>
      <TextField label="Lesson Title" value={lesson.title} onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'title', e.target.value)} fullWidth sx={{ mb: 2 }}/>
      <TextField label="Video URL (Vimeo, etc.)" value={lesson.videoUrl || ''} onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'videoUrl', e.target.value)} fullWidth sx={{ mb: 3 }}/>
      <label className={`${styles.label}`}>Resources</label>
      {lesson.resources?.map((res: any, resIndex: number) => (
        <Box key={resIndex} className="my-2 p-3 border rounded-md relative">
          <IconButton onClick={() => removeResource(moduleIndex, lessonIndex, resIndex)} sx={{ position: 'absolute', top: 5, right: 5 }}><AiOutlineDelete size={18} /></IconButton>
          <TextField label="Resource Title" value={res.title} onChange={(e) => handleResourceChange(moduleIndex, lessonIndex, resIndex, 'title', e.target.value)} fullWidth variant="standard" sx={{ mb: 2 }}/>
          {res.file && (typeof res.file === 'string' && res.file.startsWith('data:')) || res.file.objectName ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: 'grey.200', borderRadius: 1 }}><Typography variant="body2" sx={{display: 'flex', alignItems: 'center'}}><IoIosVideocam style={{marginRight: 8}} /> A file is uploaded.</Typography><IconButton onClick={() => handleResourceFileDelete(moduleIndex, lessonIndex, resIndex)}><AiOutlineDelete color="red" /></IconButton></Box>
          ) : (
            <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" onChange={(e) => handleFileChange(e, moduleIndex, lessonIndex, resIndex)} />
          )}
        </Box>
      ))}
      <Button startIcon={<AiOutlinePlusCircle />} onClick={() => addResource(moduleIndex, lessonIndex)}>Add Resource</Button>
      <Box sx={{mt: 3, borderTop: '1px solid #ccc', pt: 2}}>
        <QuizEditor quizzes={lesson.quizzes || []} {...quizHandlers} />
      </Box>
    </Box>
  );
};
export default LessonForm;