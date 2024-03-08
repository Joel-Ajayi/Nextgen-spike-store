import React, { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PageSections } from "../../../types/controller";
import CreateBrand from "./CreateBrand/CreateBrand";
import Page404 from "../../shared/Page404/Page404";
import BrandListing from "./BrandListing/BrandListing";

function Brands() {
  let [params] = useSearchParams();
  let { sec } = useParams();
  const brd_id = (params.get("brd_id") || "").replace(/-/g, " ");

  const currentPage = useMemo(() => {
    switch (sec) {
      case PageSections.CreateBrd:
        return <CreateBrand />;
      case PageSections.UpdateBrd:
        if (!brd_id) return <Page404 />;
        return <CreateBrand isUpdate brd_id={brd_id} />;
      case PageSections.BrdListing:
        return <BrandListing />;
      default:
        return <Page404 />;
    }
  }, [sec]);

  return currentPage;
}

export default Brands;
