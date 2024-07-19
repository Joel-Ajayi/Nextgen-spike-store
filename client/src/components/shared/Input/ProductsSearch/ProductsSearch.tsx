import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import Styles from "./productsSearch.module.scss";
import { IoSearch as SearchIcon } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import globalReq from "../../../../requests/global";
import { SearchResponse, SearchResultType } from "../../../../types";
import { MdOutlineBrandingWatermark as BrandIcon } from "react-icons/md";
import { BiSolidCategory as CategoryIcon } from "react-icons/bi";
import { Link } from "react-router-dom";
import { escapeRegExp } from "lodash";

type SearchProps = {
  className?: string;
};

function ProductsSearch({ className = "" }: SearchProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setSearchRes] = useState<SearchResponse[]>([]);
  const onSearchClick = () => {
    if (!showSearch) {
      setShowSearch(true);
    }
  };

  useEffect(() => {
    (async () => {
      if (search) {
        const res = await globalReq.Search(search);
        console.log(search, res);
        setSearchRes(res);
      } else if (results.length) {
        setSearchRes([]);
      }
    })();
  }, [search]);

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
      {!!results.length && (
        <div className={Styles.search_results}>
          {results.map((res) => {
            const isBrand = res.type === SearchResultType.Brand;
            const isProduct = res.type === SearchResultType.Product;
            const link = !isProduct
              ? `/products/${!isBrand ? res.name : "all"}/${
                  isBrand ? res.name : ""
                }`
              : `/product/${res.id}`;
            const regex = new RegExp(escapeRegExp(search), "i");
            let text = res.name.replace(regex, ($1) => `<b>${$1}</b>`);
            text += `${isBrand ? "  Brand" : ""} ${
              !isProduct && !isBrand ? "  Category" : ""
            }`;

            return (
              <Link to={link}>
                {res.type === SearchResultType.Category && <CategoryIcon />}
                {res.type === SearchResultType.Brand && <BrandIcon />}
                <span dangerouslySetInnerHTML={{ __html: text }} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProductsSearch;
