import React, { useMemo } from "react";
import { ProductMini } from "../../../../types/product";
import Styles from "./Styles.module.scss";
import { TbCurrencyNaira } from "react-icons/tb";
import { MdFavoriteBorder as FavoriteIcon } from "react-icons/md";
import helpers from "../../../../helpers";
import { Link } from "react-router-dom";
import { Paths } from "../../../../types";
import AddToCart from "../AddToCart/AddToCart";
import Stars from "../Stars/Stars";

type Props = {
  product: null | ProductMini;
};

function ProductCard({ product }: Props) {
  const discountPrice = useMemo(
    () =>
      product?.price
        ? helpers.addComma(((100 - product.discount) / 100) * product.price)
        : 0,
    [product?.price, product?.discount]
  );

  return (
    <div className={Styles.product}>
      {product && (
        <div className={Styles.favorite_icon}>
          <FavoriteIcon />
        </div>
      )}
      <Link
        className={Styles.product_link}
        to={`/${Paths.Product}/${product?.id}`}
      >
        <div className={Styles.image}>
          {product && <img alt="" src={`/uploads/${product.images[0]}`} />}
        </div>
        <div className={Styles.name}>{product && product.name}</div>
        <div className={Styles.rating}>
          <Stars rating={product?.rating || 0} />
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
                {helpers.addComma(product.price)}
              </>
            )}
          </div>
          {product && !!product.discount && (
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
      </Link>
      <AddToCart
        id={product?.id || ""}
        maxQty={product?.count || 0}
        isLoading={!product}
      />
    </div>
  );
}

export default ProductCard;
