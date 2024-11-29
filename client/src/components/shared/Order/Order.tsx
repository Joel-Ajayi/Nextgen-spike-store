import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import ordersReq from "../../../requests/order";
import { useParams } from "react-router-dom";
import controllerOrdersSlice from "../../../store/controller/orders";
import ordersSlice from "../../../store/order";
import Styles from "./Styles.module.scss";
import CartProductCard from "../Products/CartProductCard/CartProductCard";
import uniqId from "uniqid";
import helpers from "../../../helpers";
import { Steps } from "antd";
import PaystackPop from "@paystack/inline-js";
import "rc-steps/assets/index.css";
import Input from "../Input/Controller/Input";
import Button from "../Button/Button";

type Props = {
  isController?: boolean;
};
function Order({ isController = false }: Props) {
  const dispatch = useAppDispatch();
  const order = useAppSelector((state) =>
    isController ? state.controller.orders.order : state.orders.order
  );
  let { sec: id } = useParams();
  const isLoading = !order;
  const isRendered = useRef(false);
  const stepRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [stepFlow, setStepFlow] = useState<"vertical" | "horizontal">(
    "horizontal"
  );

  let payInterval: NodeJS.Timer | null = null;

  const actions = isController
    ? controllerOrdersSlice.actions
    : ordersSlice.actions;
  const setOrder = actions.setOrder;
  const setStatus = actions.setOrderStatus;
  const setPayStatus = controllerOrdersSlice.actions.setOrderPayStatus;
  const setIsPaid = actions.setOrderIsPaid;

  useEffect(() => {
    (async () => {
      if (!isRendered.current) {
        if (order) {
          if (order.id === id) return;
          dispatch(setOrder(null));
        }
        isRendered.current = true;
        const data = await ordersReq.getOrder(id || "", isController);
        if (data) {
          dispatch(setOrder(data));
        }
      }
    })();

    return () => {
      isRendered.current = false;
    };
  }, []);

  const onResize = () => {
    if (stepRef.current) {
      const width =
        (stepRef.current?.getBoundingClientRect().width as number) || 490;

      if (width <= 490 && stepFlow === "horizontal") {
        setStepFlow(() => "vertical");
      }

      if (width > 490 && stepFlow === "vertical") {
        setStepFlow(() => "horizontal");
      }
    }
  };

  useEffect(() => {
    setTimeout(function () {
      onResize();
    }, 20);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [stepFlow]);

  const jsxItems = useMemo(
    () =>
      isLoading
        ? new Array(3)
            .fill(0)
            .map(() => (
              <CartProductCard key={uniqId()} isOrderItem item={null} />
            ))
        : order.items.map((item) => (
            <CartProductCard
              isOrderItem
              key={uniqId()}
              item={{ ...item, discount: 0, discountPrice: 0, count: item.qty }}
            />
          )),
    [isLoading]
  );

  const isOrderCancelled = order
    ? !!order.statuses[order.statuses.length - 1].createdAt
    : false;

  const isOrderDelivered = order
    ? !!order.statuses[order.statuses.length - 2].createdAt
    : false;

  const isPayRefunded = order
    ? !!order.payStatuses[order.payStatuses.length - 1].createdAt
    : false;

  const currentStatus =
    !isOrderCancelled && order
      ? order.statuses.findIndex(
          (s, i, arr) => s.createdAt && !arr[i + 1]?.createdAt
        ) + 1
      : 2;

  const currentPayStatus =
    !isPayRefunded && order
      ? order.payStatuses.findIndex(
          (s, i, arr) => s.createdAt && !arr[i + 1]?.createdAt
        ) + 1
      : 2;

  const onInputChange = async (value: number | any, name: string) => {
    if (name === "status") {
      dispatch(setStatus(value));
    } else {
      dispatch(setPayStatus(value));
    }
  };

  const setPayState = async () => {
    if (!order) return;
    const res = await ordersReq.veifyOrderPayment(order.id);
    dispatch(setIsPaid(!!res));
  };

  const onCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    const res = await ordersReq.cancelOrder(order.id);
    if (res) {
      dispatch(setStatus(order.statuses.length - 1));
    }
    setIsCancelling(false);
  };

  const onPay = async () => {
    if (!order) return;
    setIsPaying(true);
    const res = await ordersReq.initializeOrderPay(order.id);

    if (res) {
      const popup = new PaystackPop();
      popup.resumeTransaction(res.access_code as any);
      payInterval = setInterval(() => {
        const isOpened = (popup as any).isOpen;
        if (!isOpened && (popup as any).isLoaded) {
          clearInterval(payInterval as NodeJS.Timeout);
          setTimeout(async () => {
            await setPayState();
            setIsPaying(false);
          }, 1000);
        }
      }, 500);
    } else {
      setIsPaying(false);
    }
  };

  const onSaveChanges = async () => {
    if (!order) return;
    setIsSaving(true);
    const res = await ordersReq.saveOrderChanges(
      order.id,
      currentPayStatus - 1,
      currentStatus - 1
    );
    if (res) {
      await setPayState();
    }
    setIsSaving(false);
  };

  const statuses = useMemo(() => {
    return order?.statuses.map((s, i, arr) => {
      if (isOrderCancelled) {
        return i !== 0 && i !== arr.length - 1 ? null : (
          <Steps.Step
            className={Styles.custom_step}
            title={s.status}
            status={i !== 0 ? "error" : undefined}
            description={s.createdAt || undefined}
          />
        );
      }

      return i !== arr.length - 1 ? (
        <Steps.Step
          className={Styles.custom_step}
          title={s.status}
          description={s.createdAt || undefined}
        />
      ) : null;
    });
  }, [order?.statuses]);

  const payStatuses = useMemo(() => {
    return order?.payStatuses.map((s, i, arr) => {
      if (isOrderCancelled) {
        return i !== 0 && i !== arr.length - 1 ? null : (
          <Steps.Step
            className={Styles.custom_step}
            title={s.status}
            status={i !== 0 ? "error" : undefined}
            description={s.createdAt || undefined}
          />
        );
      }

      return i !== arr.length - 1 ? (
        <Steps.Step
          className={Styles.custom_step}
          title={s.status}
          description={s.createdAt || undefined}
        />
      ) : null;
    });
  }, [order?.payStatuses]);

  return (
    <div className={Styles.wrapper}>
      <div className={Styles.inner_wrapper}>
        <div className={Styles.main}>
          <div className={Styles.items}>
            <div className={Styles.header_main}>
              {`Order ${isLoading ? "" : ` - ${order.pId}`}`}
            </div>
            <div className={Styles.content}>
              <div className={Styles.items}>
                {jsxItems}
                <div className={Styles.from}>
                  {!isLoading && (
                    <>
                      Ordered by <span>{order.user.name}</span> -
                      <span>{order.user.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {!!order && (
            <>
              <div className={Styles.order_status}>
                <div className={Styles.header}>Order Status</div>
                <div className={Styles.content}>
                  <div className={Styles.status_wrapper}>
                    <div className={Styles.progress} ref={stepRef}>
                      <Steps
                        className={Styles.custom_steps}
                        current={currentStatus}
                        status={isOrderCancelled ? "error" : undefined}
                        direction={stepFlow}
                      >
                        {statuses}
                      </Steps>
                    </div>
                    {isController && order && (
                      <div className={Styles.statuses}>
                        <Input
                          name="status"
                          type="select"
                          defaultValue={currentStatus - 1}
                          onChange={onInputChange}
                          options={order.statuses.map((s, i) => ({
                            defaultValue: i,
                            label: s.status,
                          }))}
                          changeOnMount={!isLoading}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={Styles.payment_status}>
                <div
                  className={Styles.header}
                >{`Payment Status - ${order.payMethod
                  .split("_")
                  .join(" ")}`}</div>
                <div className={Styles.content}>
                  <div className={Styles.status_wrapper}>
                    <div className={Styles.progress} ref={stepRef}>
                      <Steps
                        className={Styles.custom_steps}
                        current={currentPayStatus}
                        status={isPayRefunded ? "error" : undefined}
                        direction={stepFlow}
                      >
                        {payStatuses}
                      </Steps>
                    </div>
                    {isController && order && (
                      <div className={Styles.statuses}>
                        <Input
                          name="payStatus"
                          type="select"
                          defaultValue={currentPayStatus - 1}
                          onChange={onInputChange}
                          options={order.payStatuses.map((s, i) => ({
                            defaultValue: i,
                            label: s.status,
                          }))}
                          changeOnMount={!isLoading}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={Styles.address}>
                <div className={Styles.header}>Delivery Address</div>
                <div className={Styles.content}>
                  <div className={Styles.address_summary}>
                    <div className={Styles.address_header}>
                      <span>{!isLoading && order.address.name}</span>
                      <span className={Styles.tag}>
                        {!isLoading &&
                          (order.address.addressType as string)
                            .split("_")
                            .join(" ")}
                      </span>
                    </div>
                    <div className={Styles.address_header}>
                      <span>
                        {!isLoading &&
                          `Phone number: +234 ${order.address.tel.replace(
                            /\s/g,
                            ""
                          )}`}
                      </span>
                    </div>
                    <div className={Styles.info}>
                      {!isLoading && order.address.address}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className={Styles.summary}>
          <div className={Styles.price}>
            <div className={Styles.header}>Price Details</div>
            <div className={Styles.content}>
              <div className={Styles.subtotal}>
                {!isLoading && (
                  <>
                    <span>Price ({order.items.length} Items)</span>
                    <span>₦{helpers.addComma(order.subTotalAmount)}</span>
                  </>
                )}
              </div>
              <div className={Styles.del}>
                {!isLoading && (
                  <>
                    <span>Delivery Charges</span>
                    <span>₦{helpers.addComma(order.shippingAmount)}</span>
                  </>
                )}
              </div>
              <div className={Styles.total}>
                {!isLoading && (
                  <>
                    <span>Total Amount</span>
                    <span>₦{helpers.addComma(order.totalAmount)}</span>
                  </>
                )}
              </div>

              {isController && (
                <Button
                  value={"Save Changes"}
                  padSide={2}
                  onClick={onSaveChanges}
                  disabled={isLoading || isSaving}
                  isLoading={isSaving}
                  width="100%"
                />
              )}

              {!isController &&
                !isOrderCancelled &&
                !order?.isPaid &&
                order?.isOnlinePay && (
                  <Button
                    value={"Pay"}
                    padSide={2}
                    onClick={onPay}
                    disabled={isLoading || isPaying}
                    isLoading={isPaying}
                    width="100%"
                  />
                )}

              {!isController &&
                !isOrderCancelled &&
                !isOrderDelivered &&
                !isLoading && (
                  <Button
                    value={"Cancel Order"}
                    padSide={2}
                    className={Styles.cancel_order}
                    onClick={onCancelOrder}
                    disabled={isCancelling}
                    isLoading={isCancelling}
                    width="100%"
                  />
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Order;
