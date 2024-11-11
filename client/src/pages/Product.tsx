import React from "react";
import Header from "../components/shared/Headers/AppHeader/Header";
import Footer from "../components/shared/Footer/Footer";
import Styles from "./styles.module.scss";
import ProductPageContent from "./../components/Product/Product";
import BackgroundMsg from "../components/shared/BackgroundMsg/BackgroundMsg";

function Product() {
  return (
    <>
      <BackgroundMsg />
      <div className={Styles.page}>
        <Header />
        <ProductPageContent />
        <Footer />
      </div>
    </>
  );
}

export default Product;
