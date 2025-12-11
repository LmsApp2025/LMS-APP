import { styles } from "@/app/styles/style";
import Ratings from "@/app/utils/Ratings";
import { useAddReplyInReviewMutation, useAddReviewInCourseMutation } from "@/redux/features/courses/coursesApi";
import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import Image from "next/image";
import { format } from "timeago.js";
import React, { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { VscVerifiedFilled } from "react-icons/vsc";
import InteractiveRatings from "@/app/utils/InteractiveRatings"; // FIXED: Import the new interactive component

// Sub-component for a single review reply
const ReviewReply: FC<any> = ({ reply }) => (
    <div className="w-full flex 800px:ml-16 my-5"><Image src={reply.user.avatar ? reply.user.avatar.url : "..."} width={50} height={50} alt="" className="w-[50px] h-[50px] rounded-full object-cover"/>
      <div className="pl-2"><div className="flex items-center"><h5 className="text-[20px]">{reply.user.name}</h5><VscVerifiedFilled className="text-[#0095F6] ml-2 text-[20px]" /></div><p>{reply.comment}</p><small className="text-[#ffffff83]">{format(reply.createdAt)}</small></div>
    </div>
);

// Sub-component for a single review item
const ReviewItem: FC<any> = ({ review, user }) => {
    const [reply, setReply] = useState("");
    const [isReplying, setIsReplying] = useState(false);
    const [addReply, { isSuccess, error, isLoading }] = useAddReplyInReviewMutation();

    useEffect(() => {
        if(isSuccess){ setReply(""); setIsReplying(false); }
        // FIXED: Type guard for error
        if(error && typeof error === 'object' && 'data' in error) { toast.error((error as any).data.message); }
    }, [isSuccess, error]);

    const handleReplySubmit = () => {
        if(reply !== "") { addReply({ comment: reply, courseId: review.courseId, reviewId: review._id }); }
    };
    
    return (
        <div className="w-full my-5 dark:text-white text-black">
            <div className="w-full flex"><Image src={review.user.avatar ? review.user.avatar.url : "..."} width={50} height={50} alt="" className="w-[50px] h-[50px] rounded-full object-cover" />
                <div className="ml-2"><h1 className="text-[18px]">{review?.user.name}</h1><Ratings rating={review.rating} /><p>{review.comment}</p><small className="text-[#0000009e] dark:text-[#ffffff83]">{format(review.createdAt)}</small></div>
            </div>
            {user.role === "admin" && review.commentReplies.length === 0 && (<span className={`${styles.label} !ml-10 cursor-pointer`} onClick={() => setIsReplying(true)}>Add Reply</span>)}
            {isReplying && (<div className="w-full flex relative"><TextField placeholder="Enter your reply..." value={reply} onChange={(e) => setReply(e.target.value)} variant="standard" fullWidth sx={{ ml: { xs: 0, md: '65px' } }} /><Button onClick={handleReplySubmit} disabled={isLoading || !reply}>Submit</Button></div>)}
            {review.commentReplies.map((reply: any) => <ReviewReply key={reply._id} reply={reply} />)}
        </div>
    );
};

// Main Component
const ReviewSection: FC<any> = ({ course, user, courseRefetch }) => {
    const [rating, setRating] = useState(1);
    const [review, setReview] = useState("");
    const [addReview, { isSuccess, error, isLoading }] = useAddReviewInCourseMutation();

    const isReviewExists = course?.reviews?.find((item: any) => item.user._id === user._id);

    useEffect(() => {
        if(isSuccess){ setReview(""); setRating(1); courseRefetch(); toast.success("Review submitted"); }
        // FIXED: Type guard for error
        if(error && typeof error === 'object' && 'data' in error) { toast.error((error as any).data.message); }
    }, [isSuccess, error, courseRefetch]);

    const handleReviewSubmit = () => {
        if (review.length > 0) { addReview({ review, rating, courseId: course._id }); }
    };

    return (
        <Box>
            {!isReviewExists && (
                <>
                    <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', mb: 2 }}>
                        <Image src={user.avatar ? user.avatar.url : "..."} width={50} height={50} alt="" className="w-[50px] h-[50px] rounded-full object-cover"/>
                        <Box sx={{ width: '100%', ml: 2 }}>
                            <Typography variant="h6">Give a Rating <span className="text-red-500">*</span></Typography>
                            {/* FIXED: Use the new InteractiveRatings component */}
                            <InteractiveRatings rating={rating} setRating={setRating} />
                            <TextField placeholder="Write your comment..." value={review} onChange={(e) => setReview(e.target.value)} multiline rows={4} fullWidth sx={{ mt: 2, outline: 'none', background: 'transparent', border: '1px solid #ffffff57', borderRadius: '5px' }} />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={handleReviewSubmit} disabled={isLoading || !review} className={`${styles.button} !w-[120px] !h-[40px]`}>
                            {isLoading ? <CircularProgress size={25} color="inherit" /> : "Submit"}
                        </Button>
                    </Box>
                </>
            )}
            <Box sx={{ width: '100%', height: '1px', bgcolor: '#ffffff3b', my: 3 }} />
            <Box>
                {(course?.reviews && [...course.reviews].reverse()).map((item: any) => (
                    <ReviewItem key={item._id} review={{...item, courseId: course._id}} user={user} />
                ))}
            </Box>
        </Box>
    );
};

export default ReviewSection;