import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Brands from "../components/Controllers/Brands/Brands";
import Categories from "../components/Controllers/Categories/Categories";
import Orders from "../components/Controllers/Orders/Orders";
import Products from "../components/Controllers/Products/Products";
import BackgroundMsg from "../components/shared/BackgroundMsg/BackgroundMsg";
import { Pages } from "../types/controller";

function ControllerPage() {
  let [params] = useSearchParams();
  const page = params.get("pg");

  const currentPage = useMemo(() => {
    switch (page) {
      case Pages.Categories:
        return <Categories />;
      case Pages.Products:
        return <Products />;
      case Pages.Brand:
        return <Brands />;
      case Pages.Orders:
        return <Orders />;
      default:
        return <div>Hello</div>;
    }
  }, [page]);

  return (
    <>
      <BackgroundMsg />
      {currentPage}
    </>
  );
}

export default ControllerPage;
