import { styles } from "@/app/styles/style";
import { useAddAnswerInQuestionMutation, useAddNewQuestionMutation } from "@/redux/features/courses/coursesApi";
import Image from "next/image";
import { format } from "timeago.js";
import React, { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BiMessage } from "react-icons/bi";
import { VscVerifiedFilled } from "react-icons/vsc";
import { Box, Button, TextField, CircularProgress } from "@mui/material";

// Sub-component for a single reply
const CommentReply: FC<any> = ({ item }) => (
  <div className="w-full flex 800px:ml-16 my-5 text-black dark:text-white">
    <div><Image src={item.user.avatar ? item.user.avatar.url : "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png"} width={50} height={50} alt="" className="w-[50px] h-[50px] rounded-full object-cover" /></div>
    <div className="pl-3">
      <div className="flex items-center"><h5 className="text-[20px]">{item.user.name}</h5>{item.user.role === "admin" && <VscVerifiedFilled className="text-[#0095F6] ml-2 text-[20px]" />}</div>
      <p>{item.answer}</p><small className="text-[#ffffff83]">{format(item.createdAt)}</small>
    </div>
  </div>
);

// Sub-component for a single question item
const CommentItem: FC<any> = ({ item, courseId, contentId, refetch }) => {
  const [replyActive, setReplyActive] = useState(false);
  const [answer, setAnswer] = useState("");
  const [addAnswer, { isSuccess, error, isLoading }] = useAddAnswerInQuestionMutation();

  useEffect(() => {
    if (isSuccess) { setAnswer(""); refetch(); }
    // FIXED: Type guard for error handling
    if (error && typeof error === 'object' && 'data' in error) { toast.error((error as any).data.message); }
  }, [isSuccess, error, refetch]);

  const handleAnswerSubmit = () => {
    if (answer !== "") { addAnswer({ answer, courseId, contentId, questionId: item._id }); }
  };

  return (
    <div className="my-4">
      <div className="flex mb-2">
        <Image src={item.user.avatar ? item.user.avatar.url : "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png"} width={50} height={50} alt="" className="w-[50px] h-[50px] rounded-full object-cover" />
        <div className="pl-3 dark:text-white text-black"><h5 className="text-[20px]">{item?.user.name}</h5><p>{item?.question}</p><small className="text-[#000000b8] dark:text-[#ffffff83]">{format(item?.createdAt)}</small></div>
      </div>
      <div className="w-full flex items-center">
        <span className="800px:pl-16 text-[#000000b8] dark:text-[#ffffff83] cursor-pointer mr-2" onClick={() => setReplyActive(!replyActive)}>{!replyActive ? "Add Reply" : "Hide Replies"}</span>
        <BiMessage size={20} className="dark:text-[#ffffff83] cursor-pointer text-[#000000b8]" /><span className="pl-1 mt-[-4px] cursor-pointer text-[#000000b8] dark:text-[#ffffff83]">{item.questionReplies.length}</span>
      </div>
      {replyActive && (
        <>
          {item.questionReplies.map((reply: any) => <CommentReply key={reply._id} item={reply} />)}
          <div className="w-full flex relative dark:text-white text-black mt-4">
            <TextField placeholder="Enter your answer..." value={answer} onChange={(e) => setAnswer(e.target.value)} variant="standard" fullWidth sx={{ ml: { xs: 0, md: '80px' } }} />
            <Button onClick={handleAnswerSubmit} disabled={isLoading || !answer} sx={{ position: 'absolute', right: 0, bottom: 5 }}>Submit</Button>
          </div>
        </>
      )}
    </div>
  );
};

// Main Component
const CommentSection: FC<any> = ({ data, courseId, contentId, refetch, user }) => {
  const [question, setQuestion] = useState("");
  const [addNewQuestion, { isSuccess, error, isLoading }] = useAddNewQuestionMutation();

  useEffect(() => {
    if (isSuccess) { setQuestion(""); refetch(); }
    // FIXED: Type guard for error handling
    if (error && typeof error === 'object' && 'data' in error) { toast.error((error as any).data.message); }
  }, [isSuccess, error, refetch]);

  const handleQuestionSubmit = () => {
    if (question.length > 0) { addNewQuestion({ question, courseId, contentId }); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', width: '100%', mb: 2 }}>
        <Image src={user.avatar ? user.avatar.url : "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png"} width={50} height={50} alt="" className="w-[50px] h-[50px] rounded-full object-cover" />
        <TextField placeholder="Write your question..." value={question} onChange={(e) => setQuestion(e.target.value)} multiline rows={4} fullWidth sx={{ ml: 2, outline: 'none', background: 'transparent', border: '1px solid #ffffff57', borderRadius: '5px' }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={handleQuestionSubmit} disabled={isLoading || !question} className={`${styles.button} !w-[120px] !h-[40px]`}>
          {isLoading ? <CircularProgress size={25} color="inherit" /> : "Submit"}
        </Button>
      </Box>
      <Box sx={{ width: '100%', height: '1px', bgcolor: '#ffffff3b', my: 3 }} />
      {data?.questions.map((item: any) => (
        <CommentItem key={item._id} item={item} courseId={courseId} contentId={contentId} refetch={refetch} />
      ))}
    </Box>
  );
};

export default CommentSection;