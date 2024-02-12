import React, { useEffect, useMemo, useState } from "react";
import ControllerSideBar from "../../../shared/Headers/ControllerHeader/ControllerSideBar/ControllerSideBar";
import {
  CreatePrdSections,
  PageSections,
  Pages,
} from "../../../../types/controller";
import ProductInfo from "./ProductInfo/ProductInfo";
import { Navigate, useSearchParams } from "react-router-dom";
import CategoryAndBrand from "./CategoryAndBrand/CatgeoryAndBrand";
import ControllerStyles from "./../../controller.module.scss";
import Styles from "./createProduct.module.scss";
import Button from "../../../shared/Button/Button";
import productReq from "../../../../requests/product";
import appSlice from "../../../../store/appState";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import controllerPrdSlice from "../../../../store/controller/products";
import SpinLoader from "../../../shared/Loader/SpinLoader/SpinLoader";
import request from "../../../../requests";

function CreateProduct() {
  const dispatch = useAppDispatch();
  const formData = useAppSelector(
    (state) => state.controller.products.formData
  );
  const product = useAppSelector((state) => state.controller.products.product);
  const isFirstFormValid = useAppSelector(
    (state) => state.controller.products.product.isValid[0]
  );
  let [params] = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);

  const sub = params.get("sub");
  const prd_id = (params.get("prd_id") || "").replace(/-/g, " ");

  const { setStatusCode } = appSlice.actions;
  const {
    setProductFormData: setCreateProductData,
    setInitProductInput: setInitProductData,
  } = controllerPrdSlice.actions;

  useEffect(() => {
    (async () => {
      if (!formData.categories.length) {
        const { data, msg } = await productReq.getProductFormData(
          prd_id || undefined
        );
        if (msg?.statusCode === 404) {
          dispatch(setStatusCode(404));
          return;
        }
        dispatch(setCreateProductData(data));
      }
      if (!!prd_id && product.id !== prd_id) {
        const { data, msg } = await productReq.getProduct(prd_id);
        if (msg.statusCode === 404) {
          dispatch(setStatusCode(404));
          return;
        }
        const images = await request.getImageFiles(data.images as string[]);
        dispatch(setInitProductData({ ...data, images }));
      }

      setIsLoading(false);
    })();
  }, []);

  const currentPage = useMemo(() => {
    let navLink = `/controller?pg=${Pages.Products}&sec=${PageSections.CreatePrd}&sub=${CreatePrdSections.CategoryAndBrand}`;
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
  }, [sub, isLoading]);

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
              link={`/controller?pg=${Pages.Products}&sec=${PageSections.PrdListing}`}
            />
          </div>
        </div>
      </div>
      <div className={Styles.content}>
        <div className={Styles.sidebar}>
          <ControllerSideBar isFixed={false} />
        </div>
        {currentPage}
      </div>
    </div>
  );
}

export default CreateProduct;
