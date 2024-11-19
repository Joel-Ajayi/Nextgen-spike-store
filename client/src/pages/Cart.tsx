import React from "react";
import Header from "../components/shared/Headers/AppHeader/Header";
import BackgroundMsg from "../components/shared/BackgroundMsg/BackgroundMsg";
import Styles from "./styles.module.scss";
import CartPage from "../components/Cart/Cart";

function Cart() {
  return (
    <>
      <BackgroundMsg />
      <div className={Styles.page}>
        <Header />
        <CartPage />
      </div>
    </>
  );
}

export default Cart;
