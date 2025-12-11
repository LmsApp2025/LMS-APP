import React, { FC } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

type Props = {
    rating: number;
    setRating: (rating: number) => void;
};

const InteractiveRatings: FC<Props> = ({ rating, setRating }) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars.push(
                <AiFillStar
                    key={i}
                    size={25}
                    color="#f6b100"
                    className="mr-1 cursor-pointer"
                    onClick={() => setRating(i)}
                />
            );
        } else {
            stars.push(
                <AiOutlineStar
                    key={i}
                    size={25}
                    color="#f6ba00"
                    className="mr-1 cursor-pointer"
                    onClick={() => setRating(i)}
                />
            );
        }
    }
    return <div className="flex mt-1">{stars}</div>;
};

export default InteractiveRatings;