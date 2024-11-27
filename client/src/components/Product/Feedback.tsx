import React, { useEffect, useMemo, useRef, useState } from "react";
import Styles from "./styles.module.scss";
import { VscFeedback } from "react-icons/vsc";
import { useAppSelector } from "../../store/hooks";
import { useParams } from "react-router-dom";
import productReq from "../../requests/product";
import { dispatch } from "../../store";
import productSlice from "../../store/product";
import Input from "../shared/Input/Controller/Input";
import uniqid from "uniqid";
import { IoAdd } from "react-icons/io5";
import Stars from "../shared/Products/Stars/Stars";
import Button from "../shared/Button/Button";
import productValidator from "../../validators/product";
import { MdOutlineClear } from "react-icons/md";

function FeedbackForm({ index }: { index: number }) {
  const review = useAppSelector((state) => state.product.reviews.list[index]);
  const [isEditing, setEdit] = useState(
    review.editAble ? !review.title : false
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const { fName, lName } = useAppSelector((state) => state.user);
  const [isValid, setIsValid] = useState([true, true]);
  const [isSaving, setIsSaving] = useState(false);
  const { prd_id } = useParams();

  const setReview = productSlice.actions.setReview;
  const onInputChange = async (value: string | number | any, name: string) => {
    if (!review.editAble) return;
    const newReview = {
      ...review,
      date: new Date().toDateString(),
      [name]: value,
    };
    dispatch(
      setReview({
        index,
        review: newReview,
      })
    );

    const error = await productValidator.productReview(newReview, name);
    if (name !== "rating") {
      if (name === "title") {
        setIsValid([!error, isValid[1]]);
      } else {
        setIsValid([isValid[0], !error]);
      }
    }
    return error;
  };
  const saveEdit = async () => {
    if (isSaving) return;
    if (isEditing) {
      setIsSaving(true);
      await productReq.updateReview(
        prd_id as string,
        review.title,
        review.rating,
        review.comment
      );
      setIsSaving(false);
    }
    setEdit(!isEditing);
  };

  const deleteEdit = async () => {
    setIsDeleting(true);
    await productReq.deleteReview(prd_id as string);
    dispatch(
      setReview({
        review: {
          title: "",
          comment: "",
          editAble: review.editAble,
          rating: 0,
          date: new Date().toDateString(),
          user: `${fName} ${lName}`,
        },
        index,
      })
    );
    setIsDeleting(false);
  };

  return (
    <div className={Styles.review} style={{ order: 1 }}>
      <div className={Styles.r_content}>
        <span>{review.date}</span>
        <div className={Styles.rating}>
          {isEditing && review.rating >= 1 && (
            <div
              className={Styles.clear}
              onClick={() => {
                onInputChange(0, "rating");
              }}
            >
              <MdOutlineClear className={Styles.clear_svg} />
              Clear Rating
            </div>
          )}
          <Stars
            asinfo={!isEditing}
            rating={review.rating}
            colGap={!isEditing ? 0.4 : 0.2}
            fontSize={!isEditing ? 1.5 : 1.2}
            callback={(rating) => {
              onInputChange(rating, "rating");
            }}
          />
        </div>

        <Input
          name="title"
          asInfo={!isEditing}
          label={!isEditing ? "" : "Subject"}
          inputClass={Styles.text_bold}
          defaultValue={review.title}
          onChange={onInputChange}
        />
        <Input
          name="comment"
          type="textarea"
          asInfo={!isEditing}
          label={
            !isEditing
              ? ""
              : `Comment: Max 250 Characters(${review.comment.length})`
          }
          defaultValue={review.comment}
          onChange={onInputChange}
        />
      </div>

      <div className={Styles.sub_content}>
        {review.editAble && (
          <>
            <Button
              value={isEditing ? "Save" : "Edit"}
              disabled={
                (isEditing && isValid.includes(false)) || isSaving || isDeleting
              }
              onClick={saveEdit}
              isLoading={isSaving}
            />
            {isEditing && (
              <Button
                value="Delete"
                disabled={
                  (isEditing && isValid.includes(false)) ||
                  isSaving ||
                  isDeleting
                }
                onClick={deleteEdit}
                isLoading={isDeleting}
              />
            )}
          </>
        )}
        <span>
          Reviewed by <span className={Styles.name}>{review.user}</span>
        </span>
      </div>
    </div>
  );
}

function Feedback() {
  const [isLoading, setIsLoading] = useState(false);
  const { prd_id } = useParams();
  const reviews = useAppSelector((state) => state.product.reviews);
  const { isAuthenticated, fName, lName } = useAppSelector(
    (state) => state.user
  );
  const isRendered = useRef(false);
  const setReviews = productSlice.actions.setReviews;
  const [formIsVisible, setFormIsVisible] = useState(true);

  const loadMore = async () => {
    if (prd_id && !isLoading) {
      setIsLoading(true);
      const data = await productReq.getReviews(
        prd_id,
        reviews.skip,
        reviews.take
      );
      if (data) {
        if (reviews.page === 1 && isAuthenticated) {
          const list = [...data.list];
          const userHasReview = list.findIndex((r) => r.editAble) !== -1;

          if (!userHasReview) {
            list.push({
              title: "",
              comment: "",
              editAble: isAuthenticated,
              rating: 0,
              date: new Date().toDateString(),
              user: `${fName} ${lName}`,
            });
          }
          dispatch(setReviews({ ...data, list }));
        } else {
          dispatch(setReviews(data));
        }
        if (data.list.length) {
          setFormIsVisible(true);
        }
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isRendered.current) {
      isRendered.current = true;
      (async () => {
        await loadMore();
      })();
    }
  }, []);

  const uiReviews = useMemo(
    () => reviews.list.map((_, i) => <FeedbackForm key={uniqid()} index={i} />),
    [reviews.list.length]
  );

  return (
    <div className={Styles.tab}>
      <div className={Styles.header}>Reviews</div>
      <div className={Styles.tab_content}>
        <div className={Styles.feedback}>
          {!formIsVisible ? (
            <div className={Styles.no_comments}>
              <VscFeedback className={Styles.comments_svg} />
              <div className={Styles.no_reviews}> No Reviews!!</div>
              {isAuthenticated && (
                <div
                  className={Styles.add_comment}
                  onClick={() => setFormIsVisible(true)}
                >
                  <IoAdd /> Add Review
                </div>
              )}
            </div>
          ) : null}

          {formIsVisible && <div className={Styles.reviews}>{uiReviews}</div>}
        </div>
      </div>
    </div>
  );
}

export default Feedback;
