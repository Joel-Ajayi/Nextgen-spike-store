import React from "react";
import { ReactComponent as SearchIcon } from "../../../../images/icons/search.svg";
import Styles from "./productsSearch.module.scss";

function ProductsSearch() {
  return (
    <div className={Styles.search_wrapper}>
      <input
        className={Styles.input}
        placeholder="Search for products, brands and more"
      />
      <SearchIcon className={Styles.search_icon} />
    </div>
  );
}

export default ProductsSearch;
