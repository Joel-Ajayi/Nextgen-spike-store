import React, { useEffect } from "react";
import Styles from "./styles.module.scss";
import productReq from "../../requests/product";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useParams, useSearchParams } from "react-router-dom";
import request from "../../requests";
import productSlice from "../../store/product";
import Main from "./Main";
import Tabs from "./Tabs";

function Product() {
  const dispatch = useAppDispatch();
  const product = useAppSelector((state) => state.product);
  const { prd_id } = useParams();

  const setProduct = productSlice.actions.setProduct;

  useEffect(() => {
    (async () => {
      if (product.id !== prd_id && prd_id) {
        const data = await productReq.getProduct(prd_id);
        if (data) {
          dispatch(setProduct({ ...data }));
        }
      }
    })();
  }, []);

  return (
    <div className={Styles.content}>
      <Main />
      <Tabs />
    </div>
  );
}

export default Product;
