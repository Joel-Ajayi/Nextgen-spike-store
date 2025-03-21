import React, { useEffect, useMemo, useRef, useState } from "react";
import helpers from "../../helpers";
import Styles from "./Styles.module.scss";
import { useAppSelector } from "../../store/hooks";
import Input from "../shared/Input/Controller/Input";
import Addresses from "../Profile/Addresses/Addresses";
import Button from "../shared/Button/Button";
import { CartItem } from "../../types/product";
import { useDispatch } from "react-redux";
import cartSlice, { cartInitialState } from "../../store/cart";
import CartProductCard from "../shared/Products/CartProductCard/CartProductCard";
import { Link, useNavigate } from "react-router-dom";
import { MessageType, Paths, StatusCodes } from "../../types";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import PaystackPop from "@paystack/inline-js";
import uniqId from "uniqid";
import { UserPaths } from "../../types/user";
import appSlice from "../../store/appState";
import ordersReq from "../../requests/order";

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const miniItems = helpers.getCart();
  const cart = useAppSelector((state) => state.cart);
  const addressId = useAppSelector((state) => state.user.selectedAddress);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const isLoading = !cart.items[0];
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const [isOrdering, setIsOrdering] = useState(false);

  let payInterval: NodeJS.Timer | null = null;

  useEffect(() => {
    return () => {
      if (payInterval) {
        console.log("closed");
        clearInterval(payInterval);
      }
    };
  }, []);

  const onCheckout = () => {
    if (!isAuthenticated) {
      navigate(`${Paths.SignIn}?redirect=cart`, {
        replace: false,
      });
      return;
    } else {
      dispatch(cartSlice.actions.setIsCheckout());
      setTimeout(() => {
        if (scrollRef1.current && scrollRef2.current) {
          scrollRef1.current.scrollTo({
            top: scrollRef1.current.scrollHeight,
            behavior: "smooth",
          });
          scrollRef2.current.scrollTo({
            top: scrollRef1.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  const placeOrder = async () => {
    setIsOrdering(true);
    const res = await ordersReq.createOrder(
      addressId,
      cart.paymentMethod,
      (cart.items as CartItem[]).map((i) => i.id),
      (cart.items as CartItem[]).map((i) => i.qty)
    );

    if (res) {
      dispatch(cartSlice.actions.setCart({ ...cartInitialState, items: [] }));
      helpers.deleteCart();
      const redirect = `${Paths.Profile}/${UserPaths.Orders}/${res.orderId}`;

      // paystack
      if (res.access_code) {
        const popup = new PaystackPop();
        const popupRes = popup.resumeTransaction(res.access_code as any);
        payInterval = setInterval(() => {
          const isOpened = (popup as any).isOpen;
          const isSuccess = !!(popupRes as any).status;
          if (!isOpened && (popup as any).isLoaded) {
            clearInterval(payInterval as NodeJS.Timeout);
            dispatch(
              appSlice.actions.setBackgroundMsg({
                msg: `New Order Created Successfully! ${
                  !isSuccess ? `\nPayment is Pending` : ""
                }`,
                statusCode: StatusCodes.Ok,
                type: isSuccess ? MessageType.Success : MessageType.Error,
              })
            );
            navigate(redirect, { replace: false });
          }
        }, 500);
      } else {
        navigate(redirect, { replace: false });
        dispatch(
          appSlice.actions.setBackgroundMsg({
            msg: "New Order Created Successfully!",
            statusCode: StatusCodes.Ok,
            type: MessageType.Success,
          })
        );
      }
    }
    setIsOrdering(false);
  };

  const jsxItems = useMemo(
    () =>
      cart.items.map((item) => <CartProductCard key={uniqId()} item={item} />),
    [cart.items.length, isLoading]
  );

  const saved = useMemo(
    () =>
      !isLoading
        ? (cart.items as CartItem[]).reduce(
            (acc, curr) => acc + (curr.price - curr.discountPrice),
            0
          )
        : 0,
    [cart, isLoading]
  );

  const onChangedPayment = async (val: number) => {
    dispatch(cartSlice.actions.setPaymentMethod(val));
  };

  return (
    <div className={Styles.cart_page}>
      <div ref={scrollRef1} className={Styles.page_content}>
        <>
          {!miniItems.length && (
            <div className={Styles.no_items}>
              <img src="/uploads/no_cart" alt="logo" />
              <div className={Styles.info}>YOUR CART IS EMPTY</div>
            </div>
          )}
          {miniItems.length && (
            <div className={Styles.main}>
              <div ref={scrollRef2} className={Styles.sections}>
                <div className={Styles.cart}>
                  <div className={Styles.header_main}>
                    {cart.isCheckout ? "Order Summary" : "Shorping Cart"}
                  </div>
                  <div className={Styles.content}>
                    <div className={Styles.items}>
                      {jsxItems}
                      {!cart.isCheckout && (
                        <Link to={Paths.Catalog}>
                          <MdOutlineKeyboardBackspace /> Continue Shopping
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                {cart.isCheckout && (
                  <>
                    <div className={Styles.addresses}>
                      <div className={Styles.header}>DELIVERY ADDRESS</div>
                      <div className={Styles.content}>
                        <Addresses isSelection />
                      </div>
                    </div>
                    <div className={Styles.payment_options}>
                      <div className={Styles.header}> PAYMENT OPTIONS </div>
                      <div className={Styles.content}>
                        {" "}
                        {cart.paymentMethods.map((p, i) => (
                          <Input
                            key={uniqId()}
                            name="shippingAddress"
                            changeOnMount={false}
                            defaultChecked={cart.paymentMethod === i}
                            onChange={() => onChangedPayment(i)}
                            type="radio"
                            label={p.split("_").join(" ")}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className={Styles.summary}>
                <div className={Styles.price}>
                  <div className={Styles.header}>PRICE DETAILS</div>
                  <div className={Styles.content}>
                    <div className={Styles.subtotal}>
                      {!isLoading && (
                        <>
                          <span>Price ({cart.items.length} Items)</span>
                          <span>₦{helpers.addComma(cart.subTotalAmount)}</span>
                        </>
                      )}
                    </div>
                    <div className={Styles.del}>
                      {!isLoading && (
                        <>
                          <span>Delivery Charges</span>
                          <span>₦{helpers.addComma(cart.shippingAmount)}</span>
                        </>
                      )}
                    </div>
                    <div className={Styles.total}>
                      {!isLoading && (
                        <>
                          <span>Total Amount</span>
                          <span>₦{helpers.addComma(cart.totalAmount)}</span>
                        </>
                      )}
                    </div>
                    <div className={Styles.saved}>
                      {!isLoading && (
                        <>
                          You will save ₦{helpers.addComma(saved)} on this order
                        </>
                      )}
                    </div>
                    {cart.isCheckout && (
                      <div className={Styles.order}>
                        <Button
                          value={"PLACE ORDER"}
                          padSide={2}
                          onClick={placeOrder}
                          disabled={!addressId || isOrdering}
                          isLoading={isOrdering}
                          width="100%"
                        />
                      </div>
                    )}
                    {!cart.isCheckout && (
                      <div className={Styles.order}>
                        <Button
                          value={"CHECKOUT"}
                          padSide={2}
                          disabled={isLoading}
                          onClick={onCheckout}
                          width="100%"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      </div>
    </div>
  );
}

export default Cart;
