import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

function Orders() {
  const { sec: id } = useParams();
  useEffect(() => {
    (async () => {
      // const o = await ordersReq.getOrder(id || "");
      // const o = await ordersReq.getOrders(0, "", 10, true, 0);
    })();
  }, [id]);
  return <div>Orders</div>;
}

export default Orders;
