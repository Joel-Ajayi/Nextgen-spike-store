import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageSections } from "../../../types/controller";
import CreateBrand from "./CreateBrand/CreateBrand";
import Page404 from "../../shared/Page404/Page404";
import ControllerHeader from "../../shared/Headers/ControllerHeader/ControllerHeader";
import BrandListing from "./BrandListing/BrandListing";

function Brands() {
  let [params] = useSearchParams();
  const sec = params.get("sec");
  const brd_id = (params.get("brd_id") || "").replace(/-/g, " ");

  const currentPage = useMemo(() => {
    switch (sec) {
      case PageSections.CreateBrd:
        return <CreateBrand />;
      case PageSections.UpdateBrd:
        if (!brd_id) return <Page404 />;
        return <CreateBrand isUpdate brd_id={brd_id} />;
      case PageSections.Listing:
        return <BrandListing />;
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

export default Brands;
