import React, { useState, useEffect, useMemo } from "react";
import Table from "react-bootstrap/Table";
import Styles from "./styles.module.scss";
import Button from "../../../shared/Button/Button";
import { PageSections, ControllerPaths } from "../../../../types/controller";
import ControllerStyles from "../../controller.module.scss";
import SpinLoader from "../../../shared/Loader/SpinLoader/SpinLoader";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import controllerPrdSlice from "../../../../store/controller/products";
import productReq from "../../../../requests/product";
import uniqId from "uniqid";
import { RiEditFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { TbStarFilled, TbStar } from "react-icons/tb";
import Pagination from "../../../shared/Pagination/Pagination";

function ProductListing() {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const pagination = useAppSelector((state) => state.controller.products.list);

  const setProductList = controllerPrdSlice.actions.setProductList;
  const setPage = controllerPrdSlice.actions.setPage;

  useEffect(() => {
    (async () => {
      const data = await productReq.getProductsMini2(
        pagination.skip,
        pagination.take
      );

      if (data) {
        dispatch(setProductList(data));
      }
      setIsLoading(false);
    })();
  }, []);

  const loadPage = async (page: number, skip: number) => {
    if (!pagination.list[page]) {
      const data = await productReq.getProductsMini2(skip, pagination.take);
      if (data) dispatch(setProductList(data));
    } else {
      dispatch(setPage({ skip, page }));
    }
    return { ...pagination, skip, page, list: [] };
  };

  const pageButtons = useMemo(
    () =>
      !isLoading && (
        <Pagination
          pagination={{ ...pagination, list: [] }}
          callBack={loadPage}
        />
      ),
    [isLoading, pagination.page]
  );

  return (
    <div className={ControllerStyles.wrapper}>
      <div className={ControllerStyles.sec_header}>
        <div className={ControllerStyles.header_content}>
          <div className={ControllerStyles.title}>Product Listings</div>
          <div>
            <Button
              value="NEW PRODUCT"
              type="button"
              link={`/controller/${ControllerPaths.Products}/${PageSections.CreatePrd}`}
            />
          </div>
        </div>
      </div>
      <div className={Styles.content}>
        {!isLoading && (
          <div className={Styles.table_wrapper}>
            <Table
              className={`${Styles.products_table}`}
              striped
              bordered
              hover
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>In-Stock</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagination.list[pagination.page].map((product) => (
                  <tr key={uniqId()}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.count}</td>
                    <td>{product.price}</td>
                    <td>
                      {[1, 2, 3, 4, 5].map((index) =>
                        index >= product.rating ? (
                          <TbStarFilled
                            key={uniqId()}
                            style={{ paddingRight: 2 }}
                          />
                        ) : (
                          <TbStar key={uniqId()} style={{ paddingRight: 2 }} />
                        )
                      )}
                    </td>
                    <td>
                      <Link
                        className={Styles.edit_button}
                        to={`/controller/${ControllerPaths.Products}/${PageSections.CreatePrd}/?prd_id=${product.id}`}
                      >
                        <RiEditFill height="100%" />
                      </Link>
                      {<span style={{ padding: "0px 10px" }}>/</span>}
                      <MdDelete height="100%" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
        {pageButtons}
        {isLoading && (
          <div className={Styles.spinner}>
            <SpinLoader brandColor />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductListing;
