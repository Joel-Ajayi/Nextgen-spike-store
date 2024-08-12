import React, { useEffect, useMemo, useState } from "react";
import Styles from "./styles.module.scss";
import { Link, useParams } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import helpers from "../../helpers";
import { TbCurrencyNaira } from "react-icons/tb";
import { CatalogQuery, Paths } from "../../types";
import { FaStarHalfStroke } from "react-icons/fa6";
import uniqid from "uniqid";
import { GiRoundStar } from "react-icons/gi";

function Main() {
  const { prd_id } = useParams();
  const product = useAppSelector((state) => state.product);
  const [selectedImg, setSelectedImg] = useState("");
  const isLoading = product.id != prd_id;

  const discountPrice = useMemo(
    () =>
      product.discount
        ? helpers.reduceNumberLenth(
            ((100 - product.discount) / 100) * product.price
          )
        : 0,
    [product]
  );

  useEffect(() => {
    if (!isLoading) {
      setSelectedImg(product.images[0] as string);
    }
  }, [isLoading]);

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
                {[0, 1, 2, 3, 4].map((rating) => {
                  return rating < (product.rating || 0) &&
                    (product?.rating || 0) < rating + 1 ? (
                    <FaStarHalfStroke key={uniqid()} className={Styles.star} />
                  ) : (
                    <GiRoundStar
                      key={uniqid()}
                      className={`${
                        rating < (product?.rating || 0)
                          ? Styles.star
                          : Styles.star_less
                      }`}
                    />
                  );
                }, [])}
                {`(${product?.numReviews || 0} Reviews)`}
              </>
            )}
          </h5>
        </section>
        <section>
          <div className={Styles.price}>
            {!isLoading && (
              <>
                <div className={`${Styles.price} ${Styles.discount}`}>
                  <TbCurrencyNaira className={Styles.naira} />
                  <span>{product.price}</span>
                </div>
                {discountPrice && (
                  <div className={Styles.price}>
                    {" "}
                    <TbCurrencyNaira className={Styles.naira} />
                    <span>{discountPrice}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
        <section></section>
      </section>
    </div>
  );
}

export default Main;
