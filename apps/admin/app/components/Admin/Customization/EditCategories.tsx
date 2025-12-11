"use client";
import React from "react";
import Loader from "../../Loader/Loader";
import { styles } from "@/app/styles/style";
import { AiOutlineDelete } from "react-icons/ai";
import { IoMdAddCircleOutline } from "react-icons/io";
import { toast } from "react-hot-toast";
import { useLayout } from "@/app/hooks/useLayout"; 
import { Box, Button, TextField, IconButton } from "@mui/material";

const EditCategories = () => {
  const { isLoading, currentState, setCurrentState, isUnchanged, handleSave } = useLayout('Categories');

  const handleCategoryChange = (index: number, value: string) => {
    if (setCurrentState) {
      const updatedCategories = [...currentState];
      updatedCategories[index] = { ...updatedCategories[index], title: value };
      setCurrentState(updatedCategories);
    }
  };

  const addCategory = () => {
    if (currentState && setCurrentState) {
      if (currentState.length > 0 && currentState[currentState.length - 1].title === "") {
        toast.error("Category title cannot be empty");
      } else {
        setCurrentState([...currentState, { title: "" }]);
      }
    }
  };

  const removeCategory = (index: number) => {
    if (currentState && setCurrentState) {
      const updatedCategories = [...currentState];
      updatedCategories.splice(index, 1);
      setCurrentState(updatedCategories);
    }
  };

  const isAnyTitleEmpty = currentState?.some((cat: any) => cat.title === "");
  const canSave = !isUnchanged && !isAnyTitleEmpty;

  if (isLoading || !currentState) return <Loader />;

  return (
    <Box sx={{ mt: '120px', textAlign: 'center', position: 'relative', minHeight: '80vh', pb: '80px' }}>
      <h1 className={`${styles.title}`}>Manage Course Categories</h1>
      {currentState.map((item: any, index: number) => (
        <Box key={index} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TextField
            variant="standard"
            value={item.title}
            onChange={(e) => handleCategoryChange(index, e.target.value)}
            placeholder="Enter category title..."
            sx={{ width: '50%' }}
          />
          <IconButton onClick={() => removeCategory(index)}><AiOutlineDelete /></IconButton>
        </Box>
      ))}
      <IconButton onClick={addCategory} sx={{ mt: 2 }}><IoMdAddCircleOutline size={30} /></IconButton>
      
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={!canSave}
        sx={{
          position: 'absolute', bottom: 20, right: 20,
          backgroundColor: canSave ? '#42d383' : 'grey.500',
          '&:hover': { backgroundColor: canSave ? '#36b372' : 'grey.500' }
        }}
      >
        Save
      </Button>
    </Box>
  );
};

export default EditCategories;