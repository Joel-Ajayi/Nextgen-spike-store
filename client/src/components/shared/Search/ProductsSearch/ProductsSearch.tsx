import React from "react";
import { ReactComponent as SearchIcon } from "../../../../images/icons/search.svg";
import Styles from "./productsSearch.module.scss";

type SearchProps = {
  className?: string;
};

function ProductsSearch({ className = "" }: SearchProps) {
  return (
    <div className={`${Styles.search_wrapper} ${className}`}>
      <input
        className={Styles.input}
        placeholder="Search for products, brands and more"
      />
      <SearchIcon className={Styles.search_icon} />
    </div>
  );
}

export default ProductsSearch;
