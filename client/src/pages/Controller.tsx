import React, { useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import Brands from "../components/Controllers/Brands/Brands";
import Categories from "../components/Controllers/Categories/Categories";
import Orders from "../components/Controllers/Orders/Orders";
import Products from "../components/Controllers/Products/Products";
import BackgroundMsg from "../components/shared/BackgroundMsg/BackgroundMsg";
import { ControllerPaths } from "../types/controller";
import { useAppSelector } from "../store/hooks";
import { Roles } from "../types/user";
import ControllerHeader from "../components/shared/Headers/ControllerHeader/ControllerHeader";
// import Users from "../components/Controllers/Users/Users";

function ControllerPage() {
  let { pg: page } = useParams();
  const roles = useAppSelector((state) => state.user.roles);

  const currentPage = useMemo(() => {
    const isAuthorized = (role: Roles) =>
      roles.includes(role) || roles.includes(Roles.Global);

    switch (page) {
      case ControllerPaths.Categories:
        if (!isAuthorized(Roles.CategoryAndBrand)) break;
        return <Categories />;
      case ControllerPaths.Products:
        if (!isAuthorized(Roles.Product)) break;
        return <Products />;
      case ControllerPaths.Brand:
        if (!isAuthorized(Roles.CategoryAndBrand)) break;
        return <Brands />;
      case ControllerPaths.Orders:
        if (!isAuthorized(Roles.Order)) break;
        return <Orders />;
      // case ControllerPaths.Users:
      //   if (!isAuthorized(Roles.User)) break;
      //   return <Users />;
      default:
        return !page ? (
          <Navigate to={`/controller/${ControllerPaths.Categories}`} replace />
        ) : (
          <Navigate to="*" replace />
        );
    }
    return (
      <Navigate to={`/controller/${ControllerPaths.Categories}`} replace />
    );
  }, [page, roles]);

  return (
    <>
      <ControllerHeader />
      <BackgroundMsg />
      {currentPage}
    </>
  );
}

export default ControllerPage;
