import React, { useEffect, useLayoutEffect, useState } from "react";
import Styles from "./Styles.module.scss";
import { MdAddShoppingCart as CartIcon } from "react-icons/md";
import helpers from "../../../../helpers";
import { CartMiniItem } from "../../../../types/product";
import { IoMdAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";

type Props = {
  id: string;
  isLoading?: boolean;
  maxQty: number;
  isSmallCard?: boolean;
};

function AddToCart({
  id,
  maxQty,
  isSmallCard = true,
  isLoading = false,
}: Props) {
  const [cartItem, setCartItem] = useState<CartMiniItem>(
    helpers.getCartItem(id)
  );

  useLayoutEffect(() => {
    const item = helpers.getCartItem(id);
    if (item.id) setCartItem(item);
  }, [id]);

  const addToCart = (type: -1 | 1) => {
    const newItem = helpers.addToCart(id, type);
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
          <div className={Styles.btn} onClick={() => addToCart(-1)}>
            <RiSubtractFill />
          </div>
          <div className={Styles.qty}>{cartItem.qty}</div>
          <div
            className={`${Styles.btn} ${
              cartItem.qty >= maxQty ? Styles.disabled : ""
            }`}
            onClick={() => addToCart(1)}
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
