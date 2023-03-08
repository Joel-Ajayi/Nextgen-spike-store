import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageSections } from "../../../types/controller";
import ControllerHeader from "../../shared/Headers/ControllerHeader/ControllerHeader";
import Page404 from "../../shared/Page404/Page404";
import Category from "./Category/Category";
import CategoryListing from "./CategoryListing/CategoryListing";
import CreateCategory from "./CreateCategory/CreateCategory";

function Categories() {
  let [params] = useSearchParams();
  const navigate = useNavigate();
  const sec = params.get("sec");

  const currentPage = useMemo(() => {
    switch (sec) {
      case PageSections.Category:
        return <Category />;
      case PageSections.CreateCat:
        return <CreateCategory />;
      case PageSections.UpdateCat:
        return <CreateCategory isUpdate />;
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
