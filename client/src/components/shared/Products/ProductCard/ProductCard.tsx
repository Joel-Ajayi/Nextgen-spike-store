import React, { useMemo } from "react";
import { ProductMini } from "../../../../types/product";
import Styles from "./Styles.module.scss";
import { useAppSelector } from "../../../../store/hooks";
import { TbCurrencyNaira } from "react-icons/tb";
import { GiRoundStar } from "react-icons/gi";
import { FaStarHalfStroke } from "react-icons/fa6";
import { MdFavoriteBorder as FavoriteIcon } from "react-icons/md";
import uniqid from "uniqid";
import helpers from "../../../../helpers";
import { MdOutlineShoppingCart as CartIcon } from "react-icons/md";
import { Link } from "react-router-dom";
import { Paths } from "../../../../types";

type Props = {
  product: null | ProductMini;
};

function ProductCard({ product }: Props) {
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
    <Link to={`${Paths.Product}/${product?.id}`} className={Styles.product}>
      <div className={Styles.image}>
        {product && (
          <div className={Styles.favorite_icon}>
            <FavoriteIcon />
          </div>
        )}
        {product && <img src={`/uploads/${product.images[0]}`} />}
      </div>
      <div className={Styles.name}>{product && product.name}</div>
      <div className={Styles.rating}>
        {[0, 1, 2, 3, 4].map((rating) => {
          return rating < (product?.rating || 0) &&
            (product?.rating || 0) < rating + 1 ? (
            <FaStarHalfStroke key={uniqid()} className={Styles.star} />
          ) : (
            <GiRoundStar
              key={uniqid()}
              className={`${
                rating < (product?.rating || 0) ? Styles.star : Styles.star_less
              }`}
            />
          );
        }, [])}
        {`(${product?.numSold || 0})`}
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
                <div className={Styles.tag}>{`-${product.discount}%`}</div>
              </>
            )}
          </div>
        )}
      </div>
      <div className={Styles.add_to_cart}>
        <CartIcon className={Styles.cart_icon} />
        Add To Cart
      </div>
    </Link>
  );
}

export default ProductCard;
