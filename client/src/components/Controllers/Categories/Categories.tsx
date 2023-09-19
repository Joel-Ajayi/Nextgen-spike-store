import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageSections } from "../../../types/controller";
import ControllerHeader from "../../shared/Headers/ControllerHeader/ControllerHeader";
import Page404 from "../../shared/Page404/Page404";
import CategoryListing from "./CategoryListing/CategoryListing";
import CreateCategory from "./CreateCategory/CreateCategory";

function Categories() {
  let [params] = useSearchParams();
  const sec = params.get("sec");
  const cat_id = (params.get("cat_id") || "").replace(/-/g, " ");
  const parent = (params.get("parent") || "").replace(/-/g, " ");

  const currentPage = useMemo(() => {
    switch (sec) {
      case PageSections.CreateCat:
        return <CreateCategory parent={parent} />;
      case PageSections.UpdateCat:
        if (!cat_id) return <Page404 />;
        return <CreateCategory isUpdate cat_id={cat_id} />;
      case PageSections.CatListing:
        return <CategoryListing />;
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

export default Categories;
