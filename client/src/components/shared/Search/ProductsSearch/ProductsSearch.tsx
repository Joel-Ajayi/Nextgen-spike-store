import React, { ChangeEvent, useMemo, useState } from "react";
import Styles from "./productsSearch.module.scss";
import { IoSearch as SearchIcon } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import { IoClose } from "react-icons/io5";

type SearchProps = {
  className?: string;
};

function ProductsSearch({ className = "" }: SearchProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  const onSearchClick = () => {
    if (!showSearch) {
      setShowSearch(true);
    }
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const returnClick = () => {
    setShowSearch(false);
  };

  const onCancelSearchClick = () => {
    setSearch("");
  };

  const wrapperClass = useMemo(
    () =>
      `${Styles.search_wrapper} ${className} ${
        !showSearch ? Styles.hide_search : ""
      }`,
    [showSearch]
  );

  return (
    <div className={wrapperClass}>
      <div className={Styles.input_wrapper}>
        <IoIosArrowBack className={Styles.back_icon} onClick={returnClick} />
        <input
          className={Styles.input}
          value={search}
          onChange={onInputChange}
          placeholder="Search for products, brands and more"
        />
        {!!search && (
          <IoClose
            className={Styles.cancel_search}
            onClick={onCancelSearchClick}
          />
        )}
        {!search && (
          <SearchIcon className={Styles.search_icon} onClick={onSearchClick} />
        )}
      </div>
      <div className={Styles.search_results}></div>
    </div>
  );
}

export default ProductsSearch;
