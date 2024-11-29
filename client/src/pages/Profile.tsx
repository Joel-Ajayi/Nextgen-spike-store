import React, { useMemo } from "react";
import Header from "../components/shared/Headers/AppHeader/Header";
import BackgroundMsg from "../components/shared/BackgroundMsg/BackgroundMsg";
import { Navigate, useParams } from "react-router-dom";
import { UserPaths } from "../types/user";
// import Account from "../components/Profile/Account/Account";
import Orders from "../components/Profile/Orders/Orders";
import Styles from "./styles.module.scss";
import Addresses from "../components/Profile/Addresses/Addresses";
import Order from "../components/shared/Order/Order";

function ProfilePage() {
  let { pg: page } = useParams();
  const { sec } = useParams();

  const currentPage = useMemo(() => {
    switch (page) {
      // case UserPaths.Account:
      //   return <Account />;
      case UserPaths.Orders:
        return sec ? <Order /> : <Orders />;
      case UserPaths.Addresses:
        return <Addresses />;
      default:
        <Navigate to="*" replace />;
    }
  }, [page, sec]);

  return (
    <>
      <Header />
      <BackgroundMsg />
      <div className={Styles.page}>{currentPage}</div>
    </>
  );
}

export default ProfilePage;
