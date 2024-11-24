import React, { useEffect } from "react";
import Styles from "./styles.module.scss";
import productReq from "../../requests/product";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useParams } from "react-router-dom";
import productSlice, { initProduct } from "../../store/product";
import Main from "./Main";
import Specs from "./Specs";
import Details from "./Details";
import Feedback from "./Feedback";
import Delivery from "./Delivery";

function Product() {
  const dispatch = useAppDispatch();
  const product = useAppSelector((state) => state.product);
  const { prd_id } = useParams();

  const setProduct = productSlice.actions.setProduct;

  useEffect(() => {
    (async () => {
      if (product.id !== prd_id && prd_id) {
        const data = await productReq.getProduct(prd_id);
        if (data) dispatch(setProduct({ ...data }));
      }
    })();

    return () => {
      dispatch(setProduct(initProduct));
    };
  }, [prd_id]);

  return (
    <div className={Styles.content}>
      <Main />
      <Specs />
      <Details />
      <Delivery />
      <Feedback />
    </div>
  );
}

export default Product;
