import React from "react";
import { useAppSelector } from "../../../../store/hooks";
import Styles from "./Styles.module.scss";
import Product from "./Product";
import uniqid from "uniqid";
import Button from "../../../shared/Button/Button";

function Products() {
  const { newProducts, hotDeals, popularProducts } = useAppSelector(
    (state) => state.app.landingPageData
  );

  return (
    <>
      {!!hotDeals.length && (
        <div className={Styles.wrapper_section}>
          <div className={Styles.header}>
            <div className={Styles.section_name}>Hot Deals</div>
            <Button
              value={"See More"}
              type="button"
              link="/"
              className={Styles.see_more}
            />
          </div>
          <div className={Styles.products}>
            {hotDeals.map((product) => (
              <Product product={product} key={uniqid()} />
            ))}
          </div>
        </div>
      )}
      <div className={Styles.wrapper_section}>
        <div className={Styles.header}>
          <div className={Styles.section_name}>New Products</div>
          <Button
            value={"See More"}
            type="button"
            link="/"
            className={Styles.see_more}
          />
        </div>
        <div className={Styles.products}>
          {newProducts.map((product) => (
            <Product product={product} key={uniqid()} />
          ))}
        </div>
      </div>
      <div className={Styles.wrapper_section}>
        <div className={Styles.header}>
          <div className={Styles.section_name}>Popular Products</div>
          <Button
            value={"See More"}
            type="button"
            link="/"
            className={Styles.see_more}
          />
        </div>
        <div className={Styles.products}>
          {popularProducts.map((product) => (
            <Product product={product} key={uniqid()} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Products;
