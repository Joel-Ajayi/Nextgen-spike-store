import React, { useEffect, useMemo, useRef, useState } from "react";
import ordersReq from "../../../requests/order";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import ordersSlice from "../../../store/order";
import Styles from "./Styles.module.scss";
import ProfileStyles from "./../Styles.module.scss";
import Pagination from "../../shared/Pagination/Pagination";
import uniqId from "uniqid";
import OrderCard from "../../shared/Products/OrderCard/OrderCard";
import OrderSearch from "../../shared/Input/OrderSearch/OrderSearch";

function Orders() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.orders.orders);

  const [isLoading, setIsLoading] = useState(true);

  const isRendered = useRef(false);

  const getOrders = async (
    page = 1,
    skip = 0,
    isPageLoaded = false,
    paginate = true
  ) => {
    if (!isPageLoaded) {
      setIsLoading(true);
      const data = await ordersReq.getOrders(
        skip,
        orders.search,
        orders.take,
        false,
        paginate ? orders.count : 0
      );
      if (data) {
        if (paginate) {
          dispatch(ordersSlice.actions.onPaginateOrders(data));
        } else {
          dispatch(ordersSlice.actions.setOrders(data));
        }
      }
      setIsLoading(false);
      isRendered.current = false;
      return;
    }
    dispatch(ordersSlice.actions.setOrdersPage({ skip, page }));
    isRendered.current = false;
  };

  useEffect(() => {
    if (!isRendered.current && !orders.count) {
      isRendered.current = true;
      (async () => {
        await getOrders(1, 0, false, false);
      })();
    } else {
      setIsLoading(false);
      dispatch(
        ordersSlice.actions.setOrdersPage({
          skip: 0,
          page: orders.count ? 1 : 0,
        })
      );
    }
  }, [orders.search]);

  const memoizedOrders = useMemo(
    () =>
      orders.list[isLoading ? 0 : orders.page].map((o, i) => (
        <OrderCard key={uniqId()} order={o} />
      )),
    [isLoading, orders.page]
  );

  return (
    <div className={ProfileStyles.wrapper}>
      <div className={ProfileStyles.sec_header}>
        <div className={ProfileStyles.header_content}>
          <div className={ProfileStyles.title}>My Orders</div>
        </div>
      </div>
      <div className={ProfileStyles.content}>
        <div className={ProfileStyles.inner_content}>
          <OrderSearch />
          <div className={Styles.my_orders}>{memoizedOrders}</div>
          <Pagination path="orders.orders" callBack={getOrders} />
        </div>
      </div>
    </div>
  );
}

export default Orders;
