import React, { FC } from "react";
import { Box, Button, TextField, IconButton, Typography } from "@mui/material";
import { AiOutlineDelete, AiOutlinePlusCircle } from "react-icons/ai";
import { IoIosVideocam } from "react-icons/io";
import { styles } from "@/app/styles/style";

type Props = {
  lesson: any;
  lessonIndex: number;
  moduleIndex: number;
  handleLessonChange: (moduleIndex: number, lessonIndex: number, name: string, value: any) => void;
  handleResourceChange: (moduleIndex: number, lessonIndex: number, resourceIndex: number, name: string, value: any) => void;
  handleFileChange: (e: any, moduleIndex: number, lessonIndex: number, resourceIndex: number) => void;
  handleResourceFileDelete: (moduleIndex: number, lessonIndex: number, resourceIndex: number) => void;
  addResource: (moduleIndex: number, lessonIndex: number) => void;
  removeResource: (moduleIndex: number, lessonIndex: number, resourceIndex: number) => void;
  removeLesson: (moduleIndex: number, lessonIndex: number) => void;
  // It's better to use a generic prop for pass-throughs
  [key: string]: any;
};

const LessonForm: FC<Props> = ({
  lesson, lessonIndex, moduleIndex, removeLesson,
  handleLessonChange, handleResourceChange, handleFileChange, handleResourceFileDelete,
  addResource, removeResource,
}) => {
  return (
    <Box className="w-full bg-[#e3e1e117] p-4 my-4 rounded-md relative">
      <IconButton onClick={() => removeLesson(moduleIndex, lessonIndex)} sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
        <AiOutlineDelete color="red" />
      </IconButton>
      <Typography variant="h6" sx={{ mb: 2 }}>Lesson {lessonIndex + 1}</Typography>
      <TextField label="Lesson Title" value={lesson.title} onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'title', e.target.value)} fullWidth sx={{ mb: 2, backgroundColor: '#fff' }}/>
      <TextField label="Video URL (Vimeo HLS, etc.)" value={lesson.videoUrl || ''} onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'videoUrl', e.target.value)} fullWidth sx={{ mb: 3, backgroundColor: '#fff' }}/>

      <label className={`${styles.label}`}>Resources</label>
      {lesson.resources.map((res: any, resIndex: number) => (
        <Box key={resIndex} className="my-2 p-3 border rounded-md relative">
          <IconButton onClick={() => removeResource(moduleIndex, lessonIndex, resIndex)} sx={{ position: 'absolute', top: 5, right: 5 }}><AiOutlineDelete size={18} /></IconButton>
          <TextField label="Resource Title" value={res.title} onChange={(e) => handleResourceChange(moduleIndex, lessonIndex, resIndex, 'title', e.target.value)} fullWidth variant="standard" sx={{ mb: 2 }}/>
          
          {res.file && (typeof res.file === 'string' && res.file.startsWith('data:')) || res.file.objectName ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: 'grey.200', borderRadius: 1 }}>
                <Typography variant="body2" sx={{display: 'flex', alignItems: 'center'}}>
                    <IoIosVideocam style={{marginRight: 8}} /> A file is uploaded.
                </Typography>
                <IconButton onClick={() => handleResourceFileDelete(moduleIndex, lessonIndex, resIndex)}><AiOutlineDelete color="red" /></IconButton>
            </Box>
          ) : (
            <input 
              type="file" 
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" 
              onChange={(e) => handleFileChange(e, moduleIndex, lessonIndex, resIndex)} 
            />
          )}
        </Box>
      ))}
      <Button startIcon={<AiOutlinePlusCircle />} onClick={() => addResource(moduleIndex, lessonIndex)}>Add Resource</Button>
    </Box>
  );
};

export default LessonForm;