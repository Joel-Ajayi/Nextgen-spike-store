import React, { useEffect, useMemo, useState } from "react";
import Styles from "./styles.module.scss";
import Pagination from "../shared/Pagination/Pagination";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import catalogSlice from "../../store/catalog";
import ProductCard from "../shared/Products/ProductCard/ProductCard";
import { useLocation, useNavigate } from "react-router-dom";
import { CatalogQuery, CatalogSortQueries } from "../../types";
import Dropdown from "../shared/Dropdown/Dropdown";
import Filters from "./Filters/Filters";
import AppSideBar from "../shared/Headers/AppSideBar/AppSideBar";
import { TbArrowsSort } from "react-icons/tb";
import { RiFilter2Fill } from "react-icons/ri";
import productReq from "../../requests/product";
import { CatalogStateAPI, QueryCatalogParams } from "../../types/product";
import uniqId from "uniqid";

function Cataglog() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [isMobile, setIsMobile] = useState(document.body.clientWidth < 700);
  const catalog = useAppSelector((state) => state.catalog);
  const categories = useAppSelector((state) => state.app.headerData.categories);
  const setCatalog = catalogSlice.actions.setCatalog;
  const setPage = catalogSlice.actions.setPage;
  const onPaginate = catalogSlice.actions.onPaginate;
  const setIsParamsUpdated = catalogSlice.actions.setIsParamsUpdated;

  const sortByQuery =
    searchParams.get(CatalogQuery.SortBy) || CatalogSortQueries.Popularity;
  const category = searchParams.get(CatalogQuery.Category) || "";
  const search = searchParams.get(CatalogQuery.Search) || "";
  const brands = searchParams.get(CatalogQuery.Brand)?.split("+") || [];
  const colours = searchParams.get(CatalogQuery.Colours)?.split("+") || [];
  const discount = Number(searchParams.get(CatalogQuery.Discount)) || 0;
  const rating = Number(searchParams.get(CatalogQuery.Rating)) || 0;
  const price = searchParams.get(CatalogQuery.Price)?.split("+") || [];
  const offer = searchParams.get(CatalogQuery.Offer) || "";

  const onNavLinkChange = (
    params:
      | {
          type: CatalogQuery | string;
          query: string;
          isMultiple?: boolean;
        }
      | undefined
  ) => {
    let newVal = "";

    if (params) {
      const prevVal = searchParams.get(params.type) || "";
      if (params?.isMultiple) {
        const splitString = prevVal.split("+");
        const queryIndex = splitString.indexOf(params.query);
        if (queryIndex !== -1) {
          newVal = [...splitString]
            .filter((_, i) => i !== queryIndex)
            .join("+");
        } else {
          newVal = !prevVal
            ? params.query.trim()
            : `${prevVal}+${params.query.trim()}`;
        }
        if (newVal) {
          searchParams.set(params.type, newVal);
        } else {
          searchParams.delete(params.type);
        }
      } else {
        newVal = params.query.trim();
        searchParams.set(params.type, params.query.trim());
      }

      if (prevVal !== newVal) {
        dispatch(setIsParamsUpdated(true));
        navigate(`${location.pathname}?${searchParams.toString()}`, {
          replace: false,
        });
      }
      return;
    }

    if (searchParams.toString()) {
      dispatch(setIsParamsUpdated(true));
      navigate(`${location.pathname}`, { replace: false });
    }
  };

  const getProducts = async (
    page = 1,
    skip = 0,
    isLoaded = false,
    paginate = true
  ) => {
    if (!isLoaded) {
      const queries: QueryCatalogParams = {
        skip: 0,
        count: catalog.products.count,
        take: catalog.products.take,
        sortBy: sortByQuery,
        search,
        brands,
        colours,
        category,
        offer,
        discount,
        rating,
        priceMax: Number(price[1]) || 0,
        priceMin: Number(price[0]) || 0,
        filters: [],
      };

      catalog.filters.forEach((f) => {
        const options = searchParams
          .get(`${CatalogQuery.Filters}_${f.id}`)
          ?.toLowerCase()
          .split("+");
        if (options) {
          queries.filters.push({ id: f.id, options });
        }
      });

      const data = await productReq.queryCatalog({
        ...queries,
        skip,
        count: paginate ? queries.count : 0,
      });
      if (data) {
        if (paginate) {
          dispatch(onPaginate(data.products));
        } else {
          dispatch(setCatalog(data));
        }
      }
      return;
    }
    dispatch(setPage({ skip, page }));
  };

  useEffect(() => {
    (async () => {
      if (catalog.isParamsUpdated) {
        await getProducts(1, 0, false, false);
      }
    })();
  }, [catalog.isParamsUpdated]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (document.body.clientWidth < 700 && !isMobile) setIsMobile(true);
      if (document.body.clientWidth >= 700 && isMobile) setIsMobile(false);
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  }, [isMobile]);

  const sortDropdown = useMemo(() => {
    let initSelectedItems = ["1"];
    const dropdown = Object.keys(CatalogSortQueries).map((sortKey, i) => {
      const query =
        CatalogSortQueries[
          sortKey as keyof typeof CatalogSortQueries
        ].toString();

      if (query == sortByQuery) initSelectedItems = [`${i}`];
      return {
        title: sortKey.split("_").join(" "),
        onClick: () => {
          onNavLinkChange({ type: CatalogQuery.SortBy, query });
        },
      };
    });
    return (
      <Dropdown
        wrapperClassName={Styles.sort_by}
        title={isMobile ? "" : "Sort By"}
        items={dropdown}
        initSelectedItems={initSelectedItems}
        isRadioList
        showListSelectionButton={isMobile}
        showCaret={!isMobile}
        listOnLoad={isMobile}
        titleClassName={Styles.sort_by_title}
        isSelection={false}
        showToolTip={false}
        align={isMobile ? "r" : "l"}
        pos={isMobile ? "m" : undefined}
      />
    );
  }, [isMobile, categories.length]);

  return (
    <div className={Styles.wrapper}>
      <div className={Styles.header}>
        <div className={Styles.category}>
          {category || "Home"}
          {search ? ` - ${search}` : ""}
        </div>
        <div className={Styles.filters_and_sort}>
          {isMobile && (
            <>
              <AppSideBar
                className={Styles.filter}
                isFullWidth
                header={
                  <span className={Styles.header}>
                    <RiFilter2Fill />
                    FILTER
                  </span>
                }
              >
                <Filters />
              </AppSideBar>
              <AppSideBar
                className={Styles.sort_by_mobile}
                isFullWidth
                header={
                  <span className={Styles.header}>
                    <TbArrowsSort />
                    SORT
                  </span>
                }
              >
                {sortDropdown}
              </AppSideBar>
            </>
          )}
          {!isMobile && sortDropdown}
        </div>
      </div>
      <div className={Styles.content}>
        <div className={Styles.filter_actions}>
          <Filters />
        </div>
        <section className={Styles.products_wrapper}>
          <div className={Styles.products}>
            {catalog.products.list[
              catalog.isParamsUpdated ? 0 : catalog.products.page
            ].map((product) => (
              <ProductCard key={uniqId()} product={product} />
            ))}
          </div>
          <Pagination path="catalog.products" callBack={getProducts} />
        </section>
      </div>
    </div>
  );
}

export default Cataglog;
