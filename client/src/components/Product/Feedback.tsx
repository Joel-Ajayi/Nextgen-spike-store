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
import { Col, Progress, Row } from "antd";
import { GiRoundStar } from "react-icons/gi";

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
        <span className={Styles.date}>{review.date}</span>
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
            fontSize={!isEditing ? 1.2 : 1}
            callback={(rating) => {
              onInputChange(rating, "rating");
            }}
          />
        </div>

        {!isEditing ? (
          <span className={Styles.text_bold}>{review.title}</span>
        ) : (
          <Input
            name="title"
            asInfo={!isEditing}
            label={!isEditing ? "" : "Subject"}
            inputClass={Styles.text_bold}
            defaultValue={review.title}
            onChange={onInputChange}
          />
        )}
        {!isEditing ? (
          <span className={Styles.comment}>{review.comment}</span>
        ) : (
          <Input
            name="comment"
            type="textarea"
            rows={4}
            label={
              !isEditing
                ? ""
                : `Comment: Max 250 Characters(${review.comment.length})`
            }
            defaultValue={review.comment}
            onChange={onInputChange}
          />
        )}
      </div>

      <div className={Styles.sub_content}>
        {review.editAble && (
          <>
            <Button
              value={isEditing ? "Save" : "Edit"}
              disabled={
                (isEditing && isValid.includes(false)) || isSaving || isDeleting
              }
              padTop={0.2}
              padSide={0.8}
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
                padTop={0.2}
                padSide={0.8}
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

  const { rating, ratingCountPerRate, ratersCount } = useMemo(() => {
    const ratingCountPerRate = [0, 0, 0, 0, 0];
    let ratersCount = 0;
    const ratingsSum = reviews.list.reduce((curr, review) => {
      if (review.rating) {
        ratingCountPerRate[5 - review.rating] += 1;
        ratersCount += 1;
      }
      return curr + review.rating;
    }, 0);
    return {
      rating: parseFloat((ratingsSum / ratersCount).toFixed(1)),
      ratingCountPerRate,
      ratersCount,
    };
  }, [reviews.list]);

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
          {formIsVisible && !!rating && (
            <div className={Styles.summary}>
              <div className={Styles.ratings}>
                <div className={Styles.rating}>{`${rating} / 5`}</div>
                <Stars asinfo rating={rating} colGap={0.3} fontSize={1.1} />
                {
                  <div className={Styles.total}>
                    {ratersCount}
                    {ratersCount > 1 ? " Ratings" : " Rating"}
                  </div>
                }
              </div>
              <div className={Styles.details}>
                {ratingCountPerRate.map((count, i, arr) => (
                  <div className={Styles.row}>
                    <Col>
                      <span>{arr.length - i}</span>
                    </Col>
                    <Col>
                      <GiRoundStar
                        style={{ fontSize: "0.9rem", color: "#fba100" }}
                      />
                    </Col>
                    <Row>
                      <span>{`( ${count} ) `}</span>
                    </Row>
                    <Col span={16} style={{ marginLeft: "0.3rem" }}>
                      <Progress
                        percent={(count / ratersCount) * 100} // Percentage of total ratings
                        showInfo={false} // Hide percentage text
                        strokeColor={"#fba100"}
                      />
                    </Col>
                  </div>
                ))}
              </div>
            </div>
          )}
          {formIsVisible && <div className={Styles.reviews}>{uiReviews}</div>}
        </div>
      </div>
    </div>
  );
}

export default Feedback;
