import React, { useLayoutEffect, useState } from "react";
import Styles from "./Styles.module.scss";
import { MdAddShoppingCart as CartIcon } from "react-icons/md";
import helpers from "../../../../helpers";
import { CartMiniItem } from "../../../../types/product";
import { IoMdAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";
import { useDispatch } from "react-redux";
import cartSlice from "../../../../store/cart";
import productReq from "../../../../requests/product";

type Props = {
  id: string;
  isLoading?: boolean;
  maxQty: number;
  minQty?: number;
  isSmallCard?: boolean;
  btnSize?: number;
};

function AddToCart({
  id,
  maxQty,
  minQty = 0,
  isSmallCard = true,
  isLoading = false,
  btnSize = 35,
}: Props) {
  const dispatch = useDispatch();
  const [cartItem, setCartItem] = useState<CartMiniItem>(
    helpers.getCartItem(id)
  );

  useLayoutEffect(() => {
    const item = helpers.getCartItem(id);
    if (item.id) setCartItem(item);
  }, [id]);

  const addToCart = async (type: -1 | 1) => {
    const newItem = helpers.addToCart(id, type);
    const cartItems = await productReq.getCart();
    if (cartItems) {
      dispatch(cartSlice.actions.setCart(cartItems));
    }
    setCartItem(newItem);
  };

  return (
    <div className={Styles.wrapper}>
      {cartItem.id && !isLoading ? (
        <div
          className={Styles.add_to_cart_qty}
          style={{
            justifyContent: isSmallCard ? "space-between" : "flex-start",
          }}
        >
          <div
            className={`${Styles.btn} ${
              cartItem.qty === minQty ? Styles.disabled : ""
            }`}
            style={{ height: `${btnSize}px`, width: `${btnSize}px` }}
            onClick={() => !(cartItem.qty === minQty) && addToCart(-1)}
          >
            <RiSubtractFill />
          </div>
          <div className={Styles.qty}>{cartItem.qty}</div>
          <div
            className={`${Styles.btn} ${
              cartItem.qty >= maxQty ? Styles.disabled : ""
            }`}
            style={{ height: `${btnSize}px`, width: `${btnSize}px` }}
            onClick={() => !(cartItem.qty >= maxQty) && addToCart(1)}
          >
            <IoMdAdd />
          </div>
        </div>
      ) : (
        <div className={Styles.add_to_cart} onClick={() => addToCart(1)}>
          {!isLoading && (
            <>
              <CartIcon className={Styles.cart_icon} />
              Add To Cart
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AddToCart;
