import React, { useEffect, useMemo, useState } from "react";
import Styles from "./styles.module.scss";
import { Link, useParams } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import helpers from "../../helpers";
import { CatalogQuery, Paths } from "../../types";
import { FaStarHalfStroke } from "react-icons/fa6";
import uniqid from "uniqid";
import { GiRoundStar } from "react-icons/gi";
import AddToCart from "../shared/Products/AddToCart/AddToCart";
import { CiWarning } from "react-icons/ci";
import Stars from "../shared/Products/Stars/Stars";

function Main() {
  const { prd_id } = useParams();
  const product = useAppSelector((state) => state.product);
  const [selectedImg, setSelectedImg] = useState("");
  const isLoading = product.id != prd_id;

  useEffect(() => {
    if (!isLoading) {
      setSelectedImg(product.images[0] as string);
    }
  }, [isLoading]);

  const discountPrice = useMemo(
    () =>
      product.discount
        ? helpers.addComma(((100 - product.discount) / 100) * product.price)
        : "",
    [product]
  );

  return (
    <div className={Styles.main}>
      <section className={Styles.images}>
        <div className={Styles.selected_image}>
          {!isLoading && <img src={`/uploads/${selectedImg}`} />}
        </div>
        <div className={Styles.image_tabs}>
          {[0, 1, 2].map((i) => {
            const image = product.images[i] as string;
            if (!image && !isLoading) return null;
            const isSelected = image === selectedImg;
            return (
              <div
                className={`${Styles.image_tab} ${
                  isSelected ? Styles.selected : ""
                }`}
                onClick={() => setSelectedImg(image)}
                key={uniqid()}
              >
                {!isLoading && <img src={`/uploads/${image}`} />}
              </div>
            );
          })}
        </div>
      </section>
      <section className={Styles.main_details}>
        <section>
          <h4 className={Styles.name}>
            {!isLoading && product.name}
            {isLoading && (
              <>
                <div className={Styles.loader} />
                <div className={Styles.loader} />
              </>
            )}
          </h4>
          <div className={Styles.brand}>
            {!isLoading && (
              <>
                <span>Brand: </span>
                <Link
                  to={`${Paths.Catalog}/?${CatalogQuery.Brand}=${product.brand}`}
                >
                  {product.brand}
                </Link>
              </>
            )}
          </div>
          <div className={Styles.sku}>
            {!isLoading && (
              <>
                <span>SKU: </span>
                <span>{product.sku}</span>
              </>
            )}
          </div>
          <h5 className={Styles.rating}>
            {!isLoading && (
              <>
                <Stars rating={product?.rating || 0} fontSize={1} />
                {`(${product?.numReviews || 0} Reviews)`}
              </>
            )}
          </h5>
        </section>
        <section>
          <div className={Styles.price}>
            {!isLoading && (
              <>
                {product.discount ? (
                  <div className={Styles.price}>
                    <span>₦</span>
                    <span>{discountPrice}</span>
                  </div>
                ) : null}
                <div
                  className={product.discount ? Styles.discount : Styles.price}
                >
                  <span>₦</span>
                  <span>{helpers.addComma(product.price)}</span>
                </div>
                {product.discount ? (
                  <div className={Styles.discount_info}>
                    <span>₦</span>
                    <span>
                      {helpers.addComma(
                        (product.discount / 100) * product.price
                      )}
                    </span>
                    <div>Saved</div>
                    <span
                      className={Styles.discount}
                    >{`-${product.discount}%`}</span>
                  </div>
                ) : (
                  0
                )}
              </>
            )}
          </div>
        </section>
        <section>
          <div className={Styles.cart_sec}>
            <div className={Styles.qty_note}>
              {!isLoading && (
                <>
                  <CiWarning />
                  {product.count} Products Left
                </>
              )}
            </div>
            <AddToCart
              id={product.id || ""}
              maxQty={product.count}
              isLoading={isLoading}
              isSmallCard={false}
            />
          </div>
        </section>
      </section>
    </div>
  );
}

export default Main;
