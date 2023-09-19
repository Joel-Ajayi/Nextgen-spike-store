import React, { useMemo } from "react";
import ControllerSideBar from "../../../shared/Headers/ControllerHeader/ControllerSideBar/ControllerSideBar";
import { CreatePrdSections, PageSections, Pages } from "../../../../types/controller";
import Page404 from "../../../shared/Page404/Page404";
import ProductInfo from "./ProductInfo/ProductInfo";
import { Navigate, useSearchParams } from "react-router-dom";
import SelectBrand from "./SelectBrand/SelectBrand";
import SelectCategory from "./SelectCatgeory/SelectCategory";
import ControllerStyles from './../../controller.module.scss';
import Styles from './createProduct.module.scss'
import Button from "../../../shared/Button/Button";

function CreateProduct() {
  let [params] = useSearchParams();
  const sub = params.get("sub");
  const prd_id = (params.get("prd_id") || "").replace(/-/g, " ");

  const currentPage = useMemo(() => {
    switch (sub) {
      case CreatePrdSections.SelectBrand:
        return <SelectBrand />;
      case CreatePrdSections.SelectCategory:
        return <SelectCategory />;
      case CreatePrdSections.ProductInfo:
        return <ProductInfo />;
      default:
        return <Navigate to={`/controller?pg=${Pages.Products}&sec=${PageSections.CreatePrd}&sub=${CreatePrdSections.SelectCategory}`} />;
    }
  }, [sub]);

  return (<div className={ControllerStyles.wrapper}>
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
  </div>);
}

export default CreateProduct;
