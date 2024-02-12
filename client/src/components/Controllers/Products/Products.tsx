import React, { useMemo } from "react";
import ControllerHeader from "../../shared/Headers/ControllerHeader/ControllerHeader";
import { useSearchParams } from "react-router-dom";
import { PageSections } from "../../../types/controller";
import CreateProduct from "./CreateProduct/CreateProduct";
import Page404 from "../../shared/Page404/Page404";
import ProductListing from "./ProductListing/ProductListing";

function Products() {
  let [params] = useSearchParams();
  const sec = params.get("sec");
  const prd_id = (params.get("prd_id") || "").replace(/-/g, " ");
  // const parent = (params.get("parent") || "").replace(/-/g, " ");

  const currentPage = useMemo(() => {
    switch (sec) {
      case PageSections.CreatePrd:
        return <CreateProduct />;
      case PageSections.UpdateBrd:
        if (!prd_id) return <Page404 />;
        return <CreateProduct />;
      case PageSections.PrdListing:
        return <ProductListing />;
      default:
        return <Page404 />;
    }
  }, [sec]);

  return (
    <>
      <ControllerHeader />
      {currentPage}
    </>
  );
}

export default Products;
