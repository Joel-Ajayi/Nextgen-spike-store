import React, { useMemo } from "react";
import { ProductMini } from "../../../../types/product";
import Styles from "./Styles.module.scss";
import { useAppSelector } from "../../../../store/hooks";
import { TbCurrencyNaira } from "react-icons/tb";
import { GiRoundStar } from "react-icons/gi";
import { FaStarHalfStroke } from "react-icons/fa6";
import { MdFavoriteBorder as FavoriteIcon } from "react-icons/md";
import { IoAddOutline as AddIcon } from "react-icons/io5";
import helpers from "../../../../helpers";
import { MdOutlineShoppingCart as CartIcon } from "react-icons/md";

type Props = {
  product: null | ProductMini;
};

function Product({ product }: Props) {
  const isLoading = useAppSelector(
    (state) => state.app.isLoading || state.app.isPageLoading
  );

  const discountPrice = useMemo(
    () =>
      product?.price
        ? helpers.reduceNumberLenth(
            ((100 - product.discount) / 100) * product.price
          )
        : 0,
    []
  );

  return (
    <div className={Styles.product}>
      <div className={Styles.image}>
        {product && <img src={`/uploads/${product.images[0]}`} />}
      </div>
      <div className={Styles.name}>{product && product.name}</div>
      <div className={Styles.soldandrating}>
        <div className={Styles.rating}>
          {product && product.rating > 0 && product.rating <= 3 && (
            <FaStarHalfStroke className={Styles.star} />
          )}
          {(!product ||
            (product && (product.rating < 1 || product.rating > 3))) && (
            <GiRoundStar className={Styles.star} />
          )}
          <span>{product?.rating || 0}</span>
        </div>
        <div className={Styles.sold}>{`${product?.numSold || 0} Sold`}</div>
      </div>
      <div className={Styles.priceanddiscount}>
        <div
          className={`${Styles.price} ${
            !!product?.discount ? Styles.cancel_price : ""
          }`}
        >
          {product && (
            <>
              <TbCurrencyNaira className={Styles.naira} />
              {helpers.reduceNumberLenth(product.price)}
            </>
          )}
        </div>
        {(isLoading || (product && !!product.discount)) && (
          <div className={Styles.discount}>
            {product && (
              <>
                <TbCurrencyNaira className={Styles.naira} />
                {discountPrice}
              </>
            )}
          </div>
        )}
      </div>
      <div className={Styles.actions}>
        <div>
          <FavoriteIcon className={Styles.favorite_icon} />
        </div>
        <div>
          <AddIcon />
          <CartIcon className={Styles.cart_icon} />
          <span>Add To Cart</span>
        </div>
      </div>
    </div>
  );
}

export default Product;
