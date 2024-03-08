import React, { useMemo } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import Brands from "../components/Controllers/Brands/Brands";
import Categories from "../components/Controllers/Categories/Categories";
import Orders from "../components/Controllers/Orders/Orders";
import Products from "../components/Controllers/Products/Products";
import BackgroundMsg from "../components/shared/BackgroundMsg/BackgroundMsg";
import { Pages } from "../types/controller";
import Dashboard from "../components/Controllers/Dashboard/Dashboard";
import { useAppSelector } from "../store/hooks";
import { Roles } from "../types/user";
import ControllerHeader from "../components/shared/Headers/ControllerHeader/ControllerHeader";

function ControllerPage() {
  let { pg: page } = useParams();
  const roles = useAppSelector((state) => state.user.roles);

  const isAuthorized = (role: Roles) =>
    roles.includes(role) || roles.includes(Roles.Global);

  const currentPage = useMemo(() => {
    switch (page) {
      case Pages.Categories:
        if (!isAuthorized(Roles.CategoryAndBrand)) break;
        return <Categories />;
      case Pages.Products:
        if (!isAuthorized(Roles.Product)) break;
        return <Products />;
      case Pages.Brand:
        if (!isAuthorized(Roles.CategoryAndBrand)) break;
        return <Brands />;
      case Pages.Orders:
        if (!isAuthorized(Roles.Order)) break;
        return <Orders />;
      case Pages.DashBoard:
        return <Dashboard />;
      default:
        return !page ? (
          <Navigate to={`/controller/${Pages.DashBoard}`} replace />
        ) : (
          <Navigate to="*" replace />
        );
    }
    return <Navigate to={`/controller/${Pages.DashBoard}`} replace />;
  }, [page]);

  return (
    <>
      <ControllerHeader />
      <BackgroundMsg />
      {currentPage}
    </>
  );
}

export default ControllerPage;
