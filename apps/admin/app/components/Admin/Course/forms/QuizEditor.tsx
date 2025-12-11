import React, { FC } from "react";
import { Box, Button, TextField, IconButton, Radio, FormControlLabel, RadioGroup, Typography } from "@mui/material";
import { AiOutlineDelete, AiOutlinePlusCircle } from "react-icons/ai";
import { styles } from "@/app/styles/style";

type Props = {
  quizzes: any[];
  onQuizChange: (quizIndex: number, field: string, value: any) => void;
  onQuestionChange: (quizIndex: number, questionIndex: number, field: string, value: any) => void;
  onOptionChange: (quizIndex: number, questionIndex: number, optionIndex: number, value: string) => void;
  addQuiz: () => void;
  removeQuiz: (quizIndex: number) => void;
  addQuestion: (quizIndex: number) => void;
  removeQuestion: (quizIndex: number, questionIndex: number) => void;
  addOption: (quizIndex: number, questionIndex: number) => void;
  removeOption: (quizIndex: number, questionIndex: number, optionIndex: number) => void;
};

const QuizEditor: FC<Props> = ({
  quizzes, onQuizChange, onQuestionChange, onOptionChange,
  addQuiz, removeQuiz, addQuestion, removeQuestion, addOption, removeOption
}) => {
  return (
    <Box>
      <label className={`${styles.label} text-[20px]`}>Quizzes</label>
      {quizzes.map((quiz, quizIndex) => (
        <Box key={quizIndex} className="my-4 border rounded-md p-4 relative bg-indigo-100 dark:bg-indigo-900/30">
          <IconButton onClick={() => removeQuiz(quizIndex)} sx={{ position: 'absolute', top: 10, right: 10 }}><AiOutlineDelete color="red" /></IconButton>
          <TextField label="Quiz Title" value={quiz.title} onChange={(e) => onQuizChange(quizIndex, 'title', e.target.value)} fullWidth variant="outlined" sx={{ mb: 2, backgroundColor: '#fff' }}/>
          
          {quiz.questions.map((q: any, qIndex: number) => (
            <Box key={qIndex} className="my-3 p-3 border rounded bg-white dark:bg-slate-800 relative">
              <IconButton onClick={() => removeQuestion(quizIndex, qIndex)} sx={{ position: 'absolute', top: 5, right: 5 }}><AiOutlineDelete size={20} color="red" /></IconButton>
              <TextField label={`Question ${qIndex + 1}`} value={q.questionText} onChange={(e) => onQuestionChange(quizIndex, qIndex, 'questionText', e.target.value)} fullWidth multiline rows={2} sx={{ mb: 2 }}/>
              <RadioGroup value={q.correctAnswer} onChange={(e) => onQuestionChange(quizIndex, qIndex, 'correctAnswer', e.target.value)}>
                <Typography variant="subtitle2">Options (Select the correct one)</Typography>
                {q.options.map((opt: any, optIndex: number) => (
                  <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel value={opt.optionText} control={<Radio />} label="" />
                    <TextField variant="standard" value={opt.optionText} onChange={(e) => onOptionChange(quizIndex, qIndex, optIndex, e.target.value)} fullWidth />
                    {q.options.length > 2 && <IconButton onClick={() => removeOption(quizIndex, qIndex, optIndex)}><AiOutlineDelete size={18} /></IconButton>}
                  </Box>
                ))}
              </RadioGroup>
              <Button size="small" onClick={() => addOption(quizIndex, qIndex)} sx={{ mt: 1 }}>+ Add Option</Button>
            </Box>
          ))}
          <Button startIcon={<AiOutlinePlusCircle />} onClick={() => addQuestion(quizIndex)}>Add Question</Button>
        </Box>
      ))}
      <Button startIcon={<AiOutlinePlusCircle />} onClick={addQuiz}>Add Quiz</Button>
    </Box>
  );
};

export default QuizEditor;