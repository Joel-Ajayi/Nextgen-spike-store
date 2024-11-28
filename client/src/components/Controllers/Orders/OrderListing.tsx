import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ordersReq from "../../../requests/order";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import ordersSlice from "../../../store/controller/orders";
import Styles from "./Styles.module.scss";
import Pagination from "../../shared/Pagination/Pagination";
import uniqId from "uniqid";
import ControllerStyles from "./../controller.module.scss";
import OrderCard from "../../shared/Products/OrderCard/OrderCard";
import OrderSearch from "../../shared/Input/OrderSearch/OrderSearch";

function OrderListing() {
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
        true,
        orders.count
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
    if (!isRendered.current) {
      isRendered.current = true;
      (async () => {
        await getOrders(1, 0, false, false);
      })();
    }
  }, [orders.search]);

  const memoizedOrders = useMemo(
    () =>
      orders.list[isLoading ? 0 : orders.page].map((o, i) => (
        <OrderCard key={uniqId()} order={o} isController />
      )),
    [isLoading, orders.page]
  );

  return (
    <div className={ControllerStyles.wrapper}>
      <div className={ControllerStyles.sec_header}>
        <div className={ControllerStyles.header_content}>
          <div className={ControllerStyles.title}>Orders</div>
        </div>
      </div>
      <div className={Styles.content}>
        <OrderSearch isController />
        <div className={Styles.my_orders}>{memoizedOrders}</div>
        <Pagination path="controller.orders.orders" callBack={getOrders} />
      </div>
    </div>
  );
}

export default OrderListing;
