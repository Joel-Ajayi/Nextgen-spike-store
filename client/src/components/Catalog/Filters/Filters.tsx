import React, { useMemo, useState } from "react";
import { CatalogQuery } from "../../../types";
import { useLocation, useMatch, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import Styles from "./styles.module.scss";
import Dropdown, { DropdownProps } from "../../shared/Dropdown/Dropdown";
import { CategoryMicro } from "../../../types/category";
import { IoArrowBack } from "react-icons/io5";
import catalogSlice from "../../../store/catalog";
import { GiRoundStar } from "react-icons/gi";
import uniqid from "uniqid";

function Filters() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const categories = useAppSelector((state) => state.app.headerData.categories);
  const catalog = useAppSelector((state) => state.catalog);
  const setIsParamsUpdated = catalogSlice.actions.setIsParamsUpdated;
  const searchParams = new URLSearchParams(location.search);
  const brands =
    searchParams.get(CatalogQuery.Brand)?.toLowerCase()?.split("+") || [];
  const category = searchParams.get(CatalogQuery.Category)?.toLowerCase() || "";
  const rating = Number(searchParams.get(CatalogQuery.Rating)) || 0;
  const price = searchParams.get(CatalogQuery.Price)?.split("+") || [];
  const priceRange =
    searchParams.get(CatalogQuery.PriceRange)?.split("+") || [];

  const onNavLinkChange = (
    params:
      | {
          type: CatalogQuery | string;
          query: string;
          isMultiple?: boolean;
        }[]
      | undefined
  ) => {
    const searchParams = new URLSearchParams(location.search);
    let newVal = "";

    if (params?.length) {
      params.forEach((param) => {
        const prevVal = searchParams.get(param.type) || "";
        if (param?.isMultiple) {
          const splitString = prevVal.split("+");
          const queryIndex = splitString.indexOf(param.query);
          if (queryIndex !== -1) {
            newVal = [...splitString]
              .filter((_, i) => i !== queryIndex)
              .join("+");
          } else {
            newVal = !prevVal
              ? param.query.trim()
              : `${prevVal}+${param.query.trim()}`;
          }
          if (newVal) {
            searchParams.set(param.type, newVal);
          } else {
            searchParams.delete(param.type);
          }
        } else {
          newVal = param.query.trim();
          searchParams.set(param.type, param.query.trim());
        }
      });

      navigate(`${location.pathname}?${searchParams.toString()}`, {
        replace: false,
      });
      setTimeout(() => {
        dispatch(setIsParamsUpdated(true));
      }, 200);
      return;
    }

    if (searchParams.toString()) {
      dispatch(setIsParamsUpdated(true));
      navigate(`${location.pathname}`, { replace: false });
    }
  };

  const categoryDropdown = useMemo(() => {
    if (!categories.length) return null;

    let mainCategory = category;
    let categoryObj = [...categories].find(
      (c) => c.name.toLowerCase() === category
    ) as CategoryMicro;
    let categoryItems = [...categories].filter(
      (c) => c.parent.toLowerCase() === category
    );
    let parent = "";
    if (categoryObj) {
      if (!categoryItems.length) {
        categoryItems = [...categories].filter(
          (c) => c.parent === categoryObj.parent
        );
        mainCategory = categoryObj.parent;
        categoryObj = [...categories].find(
          (c) => c.name.toLowerCase() === categoryObj.parent.toLowerCase()
        ) as CategoryMicro;
      }
      parent = categoryObj.parent;
    }

    const items = [
      {
        title: "Browse Categories",
        pos: "m",
        overflowY: true,
        isSelected: true,
        listOnLoad: true,
        isRadioList: true,
        showToolTip: false,
        showCaret: false,
        titleClassName: Styles.filter_header,
        borderBottom: true,
        showListSelectionButton: false,
        initSelectedItems: mainCategory === category ? [`${0}`] : [],
        items: [
          {
            title: `${mainCategory}`,
            Icon: IoArrowBack,
            showTitle: !!mainCategory,
            listOnLoad: true,
            isRadioList: true,
            showToolTip: false,
            showCaret: false,
            showListSelectionButton: false,
            borderBottom: true,
            onClick: () => {
              onNavLinkChange([
                {
                  type: CatalogQuery.Category,
                  query: category === mainCategory ? parent : mainCategory,
                },
              ]);
            },
            items: categoryItems.map((c) => ({
              title: c.name,
              borderBottom: true,
              onClick: () => {
                onNavLinkChange([
                  { type: CatalogQuery.Category, query: c.name },
                ]);
              },
            })),
            initSelectedItems:
              mainCategory === category
                ? []
                : [
                    `${categoryItems.findIndex(
                      (c) => c.name.toLowerCase() === category
                    )}`,
                  ],
          },
        ],
      },
    ] as DropdownProps[];

    return (
      <Dropdown
        pos="m"
        listOnLoad
        isRadioList
        borderBottom
        wrapperClassName={Styles.filter}
        showListSelectionButton={false}
        initSelectedItems={[`${0}`]}
        items={items}
      />
    );
  }, [category, categories.length]);

  const brandsDropDown = useMemo(() => {
    if (!catalog.brands.length) return;

    const initSelectedItems: string[] = [];
    const items = catalog.brands.map((brd, i) => {
      if (brands.includes(brd.toLowerCase())) initSelectedItems.push(`${i}`);

      return {
        title: brd,
        borderBottom: true,
        onClick: () => {
          onNavLinkChange([
            {
              type: CatalogQuery.Brand,
              query: brd,
              isMultiple: true,
            },
          ]);
        },
      };
    });

    return (
      <Dropdown
        pos="m"
        listOnLoad
        isRadioList
        borderBottom
        wrapperClassName={Styles.filter}
        showListSelectionButton={false}
        initSelectedItems={[`${0}`]}
        items={[
          {
            title: "Brand",
            pos: "m",
            overflowY: true,
            isSelected: true,
            listOnLoad: true,
            isCheckList: true,
            showToolTip: false,
            isSearch: true,
            showCaret: false,
            titleClassName: Styles.filter_header,
            borderBottom: true,
            initSelectedItems,
            items,
          },
        ]}
      />
    );
  }, [catalog.isParamsUpdated]);

  const ratingDropdown = useMemo(() => {
    return (
      <Dropdown
        pos="m"
        listOnLoad
        isRadioList
        borderBottom
        wrapperClassName={Styles.filter}
        showListSelectionButton={false}
        initSelectedItems={[`${0}`]}
        items={[
          {
            title: "Rating",
            pos: "m",
            overflowY: true,
            isSelected: true,
            listOnLoad: true,
            isRadioList: true,
            showToolTip: false,
            showCaret: false,
            titleClassName: Styles.filter_header,
            borderBottom: true,
            initSelectedItems: [`${rating}`],
            items: Array.from("12345").map((_, i, arr) => {
              const rating = i;
              return {
                title: (
                  <div className={Styles.rating}>
                    {arr.map((_, i) => (
                      <GiRoundStar
                        key={uniqid()}
                        className={i < rating ? Styles.star : Styles.star_less}
                      />
                    ))}
                  </div>
                ),
                borderBottom: true,
                onClick: () => {
                  onNavLinkChange([
                    {
                      type: CatalogQuery.Rating,
                      query: `${rating}`,
                    },
                  ]);
                },
              };
            }),
          },
        ]}
      />
    );
  }, [catalog.isParamsUpdated]);

  const priceDrpdown = useMemo(() => {
    const rangeMin = priceRange[1] ? Number(priceRange[0]) : undefined;
    const rangeMax = priceRange[1] ? Number(priceRange[1]) : undefined;
    const selectedMinRange = price[1] ? Number(price[0]) : undefined;
    const selectedMaxRange = price[1] ? Number(price[1]) : undefined;
    console.log(price);
    return (
      <Dropdown
        pos="m"
        listOnLoad
        isRadioList
        borderBottom
        wrapperClassName={Styles.filter}
        showListSelectionButton={false}
        initSelectedItems={[`${0}`]}
        items={[
          {
            title: "PRICE",
            pos: "m",
            overflowY: true,
            isSelected: true,
            listOnLoad: true,
            isCheckList: true,
            showToolTip: false,
            maxRange: rangeMax,
            minRange: rangeMin,
            selectedMaxRange,
            selectedMinRange,
            onClick: (price) => {
              onNavLinkChange([
                {
                  type: CatalogQuery.Price,
                  query: price.split("_")[0],
                },
                {
                  type: CatalogQuery.PriceRange,
                  query: price.split("_")[1],
                },
              ]);
            },

            isRange: true,
            showCaret: false,
            titleClassName: Styles.filter_header,
            borderBottom: true,
          },
        ]}
      />
    );
  }, [catalog.isParamsUpdated]);

  const categoryFilters = useMemo(() => {
    if (!catalog.filters.length) return null;

    const items = catalog.filters.map((filter, i) => {
      const queryType = `${CatalogQuery.Filters}_${filter.id}`;
      const initSelectedItems: string[] = [];
      const options = (searchParams.get(queryType) || "")
        .toLowerCase()
        .split("+");

      const items = filter.options.map((option, i) => {
        if (options?.length && options.includes(option.toLowerCase())) {
          initSelectedItems.push(`${i}`);
        }

        return {
          title: option,
          borderBottom: true,
          onClick: () => {
            onNavLinkChange([
              {
                type: queryType,
                query: option,
                isMultiple: true,
              },
            ]);
          },
        };
      });

      return {
        title: filter.name,
        pos: "m",
        borderBottom: true,
        isSelected: true,
        listOnLoad: true,
        isCheckList: true,
        showToolTip: false,
        showCaret: false,
        titleClassName: Styles.filter_header,
        initSelectedItems,
        items,
      };
    }) as DropdownProps[];

    return (
      <Dropdown
        pos="m"
        listOnLoad
        isRadioList
        borderBottom
        wrapperClassName={Styles.filter}
        showListSelectionButton={false}
        initSelectedItems={catalog.filters.map((_, i) => `${i}`)}
        items={items}
      />
    );
  }, [catalog.isParamsUpdated]);

  return (
    <div className={Styles.filters}>
      <section>{categoryDropdown}</section>
      <section>{priceDrpdown}</section>
      <section>{brandsDropDown}</section>
      <section>{ratingDropdown}</section>
      <section>{categoryFilters}</section>
    </div>
  );
}

export default Filters;
