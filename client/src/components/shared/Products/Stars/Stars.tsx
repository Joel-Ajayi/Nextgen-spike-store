import React, { useEffect } from "react";
import Styles from "./Stars.module.scss";
import uniqid from "uniqid";
import { FaStarHalfStroke } from "react-icons/fa6";
import { GiRoundStar } from "react-icons/gi";

function Stars({
  rating: prdRating,
  colGap = 0.1,
  fontSize = 0.75,
  asinfo = true,
  callback,
}: {
  rating: number;
  colGap?: number;
  fontSize?: number;
  asinfo?: boolean;
  callback?: (rating: number) => void;
}) {
  return (
    <div
      className={Styles.rating}
      style={{ columnGap: `${colGap}rem`, fontSize: `${fontSize}rem` }}
    >
      {[0, 1, 2, 3, 4].map((rating) => {
        return rating < prdRating && prdRating < rating + 1 ? (
          <FaStarHalfStroke key={uniqid()} className={Styles.star} />
        ) : (
          <GiRoundStar
            key={uniqid()}
            onClick={
              !asinfo && callback ? () => callback(rating + 1) : () => {}
            }
            style={!asinfo ? { cursor: "pointer" } : {}}
            className={`${rating < prdRating ? Styles.star : Styles.star_less}`}
          />
        );
      }, [])}
    </div>
  );
}

export default Stars;
