import React, { useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PageSections } from "../../../types/controller";
import Page404 from "../../shared/Page404/Page404";
import CategoryListing from "./CategoryListing/CategoryListing";
import CreateCategory from "./CreateCategory/CreateCategory";

function Categories() {
  let [params] = useSearchParams();
  let { sec } = useParams();
  const cat_id = (params.get("cat_id") || "").replace(/-/g, " ");
  const parent = (params.get("parent") || "").replace(/-/g, " ");

  const currentPage = useMemo(() => {
    switch (sec) {
      case PageSections.CreateCat:
        return <CreateCategory parent={parent.replace("%26", "&")} />;
      case PageSections.UpdateCat:
        if (!cat_id) return <Page404 />;
        return <CreateCategory isUpdate cat_id={cat_id.replace("%26", "&")} />;
      case PageSections.CatListing:
        return <CategoryListing />;
      default:
        return <Page404 />;
    }
  }, [sec]);

  return currentPage;
}

export default Categories;
