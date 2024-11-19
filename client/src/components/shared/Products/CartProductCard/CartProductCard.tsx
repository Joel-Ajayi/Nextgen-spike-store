import React, { useState } from "react";
import Styles from "./Styles.module.scss";
import { CartItem } from "../../../../types/product";
import helpers from "../../../../helpers";
import AddToCart from "../AddToCart/AddToCart";
import productReq from "../../../../requests/product";
import { useDispatch } from "react-redux";
import cartSlice from "../../../../store/cart";

function CartProductCard({ item }: { item: CartItem | null }) {
  const isLoading = !item;
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const removeItem = async () => {
    if (item) {
      setIsDeleting(true);
      helpers.deleteCartItem(item.id);
      const cartItems = await productReq.getCart();
      if (cartItems) {
        dispatch(cartSlice.actions.setCart(cartItems));
      }
      setIsDeleting(false);
    }
  };

  return (
    <div className={`${Styles.item} ${isDeleting ? Styles.disabled : ""}`}>
      <div className={Styles.image}>
        {!isLoading && <img src={`/uploads/${item?.image}`} />}
      </div>
      <div className={Styles.details}>
        <div className={Styles.name}>
          {!isLoading && <span>{item.name}</span>}
        </div>
        {isLoading && <div className={Styles.name_dummy} />}
        <div className={Styles.priceanddiscount}>
          {!!item?.discount && (
            <div className={Styles.discount}>
              {!!item && (
                <>
                  <span>₦{helpers.addComma(item.discountPrice)}</span>
                </>
              )}
            </div>
          )}
          <div
            className={`${Styles.price} ${
              !!item?.discount && Styles.cancel_price
            }`}
          >
            {!!item && (
              <>
                <span>₦{helpers.addComma(item.price)}</span>{" "}
                {!!item.discount && (
                  <span className={Styles.tag}>{`${item.discount}% off`}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className={Styles.actions}>
        <div className={Styles.add}>
          {!isLoading && item && (
            <AddToCart
              id={item.id}
              maxQty={item.count}
              minQty={1}
              btnSize={30}
              isLoading={isLoading}
            />
          )}
        </div>
        <div className={Styles.remove}>
          {!isLoading && (
            <>
              <span onClick={removeItem}>REMOVE</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartProductCard;
