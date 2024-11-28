import React, { ChangeEvent, useState } from "react";
import { IoSearch as SearchIcon } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import Styles from "./Styles.module.scss";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import ordersSlice from "../../../../store/order";
import controllerOrdersSlice from "../../../../store/controller/orders";

function OrderSearch({ isController = false }: { isController?: boolean }) {
  const dispatch = useAppDispatch();

  const search = useAppSelector((state) =>
    isController
      ? state.controller.orders.orders.search
      : state.orders.orders.search
  );

  const setSearch = isController
    ? controllerOrdersSlice.actions.setOrdersSearch
    : ordersSlice.actions.setOrdersSearch;

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value !== search) {
      dispatch(setSearch(e.target.value));
    }
  };

  const onCancelSearchClick = () => {
    dispatch(setSearch(""));
  };

  return (
    <div className={Styles.wrapper}>
      <div className={Styles.input_wrapper}>
        <input
          className={Styles.input}
          value={search}
          onChange={onInputChange}
          placeholder={`Search for orders by order ID ${
            !isController ? "" : "or user email"
          }`}
        />
        {!!search && (
          <IoClose
            className={Styles.cancel_search}
            onClick={onCancelSearchClick}
          />
        )}
      </div>
    </div>
  );
}

export default React.memo(OrderSearch);
