import React from "react";
import Styles from "./productsSearch.module.scss";
import { IoSearch as SearchIcon } from "react-icons/io5";

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
