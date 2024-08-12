import React from "react";
import Header from "../components/shared/Headers/AppHeader/Header";
import Footer from "../components/shared/Footer/Footer";
import Styles from "./styles.module.scss";
import ProductPageContent from "./../components/Product/Product";
import Features from "../components/Home/Features/Features";

function Product() {
  return (
    <div className={Styles.page}>
      <Header />
      <ProductPageContent />
      <Features />
      <Footer />
    </div>
  );
}

export default Product;
