import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CategoryType } from "../../../types/category";
import { PageSections } from "../../../types/controller";
import ControllerHeader from "../../shared/Headers/ControllerHeader/ControllerHeader";
import Page404 from "../../shared/Page404/Page404";
import CategoryListing from "./CategoryListing/CategoryListing";
import CreateCategory from "./CreateCategory/CreateCategory";

function Categories() {
  let [params] = useSearchParams();
  const navigate = useNavigate();
  const sec = params.get("sec");
  const type = params.get("type") as CategoryType;
  const cat_id = params.get("cat_id");
  const parent = params.get("parent") || "";

  const currentPage = useMemo(() => {
    switch (sec) {
      case PageSections.CreateCat:
        if (!type || !Object.values(CategoryType).includes(type))
          return <Page404 />;
        if (type !== CategoryType.SuperOrd && !parent) return <Page404 />;
        return <CreateCategory parent={parent} type={type} />;
      case PageSections.UpdateCat:
        if (!cat_id || !type || !Object.values(CategoryType).includes(type))
          return <Page404 />;
        return <CreateCategory isUpdate cat_id={cat_id} type={type} />;
      case PageSections.Listing:
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
