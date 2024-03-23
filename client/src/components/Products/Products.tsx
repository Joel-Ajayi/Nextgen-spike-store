import React, { useEffect, useMemo, useState } from "react";
import Styles from "./styles.module.scss";
import Pagination from "../shared/Pagination/Pagination";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import productsSlice from "../../store/products";
import productReq from "../../requests/product";
import Product from "../Home/Products/Product";

function Products() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const pagination = useAppSelector((state) => state.products);

  const setProducts = productsSlice.actions.setProducts;

  const getProducts = async (page = 1) => {
    if (!pagination.list[page - 1]) {
      const skip = pagination.take * (page - 1);
      const { list, ...rest } = await productReq.search({ skip });
      const newList = [...pagination.list];
      newList[page - 1] = list[0];
      const newPagination = { ...rest, list: newList };
      dispatch(setProducts(newPagination));
      return newPagination;
    }
    return pagination;
  };

  useEffect(() => {
    (async () => {
      // await getProducts();
      setIsLoading(false);
    })();
  }, []);

  const paginationJSX = useMemo(
    () =>
      !isLoading && (
        <Pagination
          pagination={pagination}
          callBack={getProducts}
          specifiedMaxButtons={4}
        />
      ),
    [isLoading]
  );

  return (
    <div className={Styles.wrapper}>
      <div className={Styles.content}>
        <div className={Styles.filters}></div>
        <div className={Styles.products_wrapper}>
          <div className={Styles.filters_actions}>
            <div className={Styles.filter}>Filter</div>
            <div className={Styles.sort}>Sort By</div>
          </div>
          <div className={Styles.products}>
            {pagination.list.map((page) =>
              page.map((product) => <Product product={product} />)
            )}
          </div>
          {paginationJSX}
        </div>
      </div>
    </div>
  );
}

export default Products;
