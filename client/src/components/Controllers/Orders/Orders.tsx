import React, { useMemo } from "react";
import OrderListing from "./OrderListing";
import { useParams } from "react-router-dom";
import Order from "../../shared/Order/Order";

function Orders() {
  let { sec } = useParams();

  const currentPage = useMemo(
    () => (sec ? <Order isController /> : <OrderListing />),
    [sec]
  );
  return currentPage;
}

export default Orders;
