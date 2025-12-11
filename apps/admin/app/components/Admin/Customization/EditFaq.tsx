"use client";
import React, { useState } from "react";
import Loader from "../../Loader/Loader";
import { styles } from "@/app/styles/style";
import { AiOutlineDelete } from "react-icons/ai";
import { HiMinus, HiPlus } from "react-icons/hi";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useLayout } from "@/app/hooks/useLayout";
import { Box, Button, TextField, IconButton, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";

const EditFaq = () => {
  const { isLoading, currentState, setCurrentState, isUnchanged, handleSave } = useLayout('FAQ');
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleExpansion = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    if (setCurrentState) {
      const updatedFaq = [...currentState];
      updatedFaq[index][field] = value;
      setCurrentState(updatedFaq);
    }
  };

  const addFaq = () => {
    if (setCurrentState) {
      setCurrentState([...currentState, { question: "", answer: "" }]);
    }
  };
  
  const removeFaq = (index: number) => {
    if (setCurrentState) {
      const updatedFaq = [...currentState];
      updatedFaq.splice(index, 1);
      setCurrentState(updatedFaq);
    }
  };

  const isAnyFieldEmpty = currentState?.some((faq: any) => faq.question === "" || faq.answer === "");
  const canSave = !isUnchanged && !isAnyFieldEmpty;

  if (isLoading || !currentState) return <Loader />;

  return (
    <Box sx={{ width: '90%', m: 'auto', mt: '120px', position: 'relative', pb: '80px' }}>
      <h1 className={`${styles.title}`}>Edit FAQ</h1>
      {currentState.map((item: any, index: number) => (
        <Accordion key={index} expanded={expanded === `panel${index}`} onChange={handleExpansion(`panel${index}`)}>
          <AccordionSummary expandIcon={<HiPlus />} sx={{width: '100%'}}>
            <TextField variant="standard" value={item.question} onChange={(e) => handleFaqChange(index, 'question', e.target.value)} fullWidth placeholder="Add your question..."/>
            <IconButton onClick={() => removeFaq(index)}><AiOutlineDelete /></IconButton>
          </AccordionSummary>
          <AccordionDetails>
            <TextField variant="outlined" value={item.answer} onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} fullWidth multiline rows={4} placeholder="Add your answer..."/>
          </AccordionDetails>
        </Accordion>
      ))}
      <IconButton onClick={addFaq} sx={{ mt: 2 }}><IoMdAddCircleOutline size={30} /></IconButton>
      <Button variant="contained" onClick={handleSave} disabled={!canSave} sx={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: canSave ? '#42d383' : 'grey.500' }}>Save</Button>
    </Box>
  );
};

export default EditFaq;