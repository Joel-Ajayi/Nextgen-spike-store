import React, { useLayoutEffect, useMemo, useState } from "react";
import {
  CreatePrdSections,
  PageSections,
  ControllerPaths,
} from "../../../../types/controller";
import ProductInfo from "./ProductInfo/ProductInfo";
import { Navigate, useSearchParams } from "react-router-dom";
import CategoryAndBrand from "./CategoryAndBrand/CatgeoryAndBrand";
import ControllerStyles from "./../../controller.module.scss";
import Styles from "./createProduct.module.scss";
import Button from "../../../shared/Button/Button";
import productReq from "../../../../requests/product";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import controllerPrdSlice from "../../../../store/controller/products";
import SpinLoader from "../../../shared/Loader/SpinLoader/SpinLoader";
import request from "../../../../requests";

function CreateProduct() {
  const dispatch = useAppDispatch();
  const product = useAppSelector((state) => state.controller.products.product);
  const isFirstFormValid = useAppSelector(
    (state) => state.controller.products.product.isValid[0]
  );
  let [params] = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);

  const sub = params.get("sub");
  const prd_id = (params.get("prd_id") || "").replace(/-/g, " ");

  const { setProductFormData, setInitProductInput } =
    controllerPrdSlice.actions;

  useLayoutEffect(() => {
    (async () => {
      const formData = await productReq.getProductFormData(prd_id || undefined);
      if (formData) dispatch(setProductFormData(formData));
      if (!!prd_id && product.id !== prd_id) {
        const data = await productReq.getProduct(prd_id);
        if (data) {
          const images = await request.getImageFiles(data.images as string[]);
          dispatch(setInitProductInput({ ...data, images }));
        }
      }

      setIsLoading(false);
    })();
  }, [prd_id]);

  const currentPage = useMemo(() => {
    let navLink = `/controller/${ControllerPaths.Products}/${PageSections.CreatePrd}?sub=${CreatePrdSections.CategoryAndBrand}`;
    navLink += prd_id ? `&prd_id=${prd_id}` : "";

    if (isLoading && sub) {
      return (
        <div className={Styles.spinner_wrapper}>
          <SpinLoader brandColor />
        </div>
      );
    }

    switch (sub) {
      case CreatePrdSections.CategoryAndBrand:
        return <CategoryAndBrand />;
      case CreatePrdSections.ProductInfo:
        return !isFirstFormValid ? (
          <Navigate to={navLink} replace />
        ) : (
          <ProductInfo />
        );
      default:
        return <Navigate to={navLink} replace />;
    }
  }, [sub, prd_id, isLoading]);

  return (
    <div className={ControllerStyles.wrapper}>
      <div className={ControllerStyles.sec_header}>
        <div className={ControllerStyles.header_content}>
          <div className={ControllerStyles.title}>ADD PRODUCT</div>
          <div>
            <Button
              value="ALL PRODUCTS"
              type="button"
              className={Styles.all_prd_button}
              link={`/controller/${ControllerPaths.Products}/${PageSections.PrdListing}`}
            />
          </div>
        </div>
      </div>
      <div className={ControllerStyles.content}>
        <div className={ControllerStyles.inner_content}>{currentPage}</div>
      </div>
    </div>
  );
}

export default CreateProduct;
