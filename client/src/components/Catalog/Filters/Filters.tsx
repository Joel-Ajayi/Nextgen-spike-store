import React, { useMemo } from "react";
import { CatalogQuery } from "../../../types";
import { useLocation, useMatch, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import Styles from "./styles.module.scss";
import Dropdown, { DropdownProps } from "../../shared/Dropdown/Dropdown";
import { CategoryMicro } from "../../../types/category";
import { IoArrowBack } from "react-icons/io5";

function Filters() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const categories = useAppSelector((state) => state.app.headerData.categories);

  const searchParams = new URLSearchParams(location.search);
  const category =
    searchParams.get(CatalogQuery.Category)?.toLocaleLowerCase() || "";

  const onNavLinkChange = (
    params:
      | { type: CatalogQuery; query: string; isMultiple?: boolean }
      | undefined
  ) => {
    let newVal = "";

    if (params) {
      if (params?.isMultiple) {
        const prevVal = searchParams.get(params.type) || "";
        const splitString = prevVal.split("+");
        const queryIndex = splitString.indexOf(params.query);
        if (queryIndex !== -1) {
          newVal = splitString.splice(queryIndex, 1).join("+");
        } else {
          newVal = `${prevVal}+${params.query}`;
        }

        if (newVal) {
          searchParams.set(params.type, params.query);
        } else {
          searchParams.delete(params.type);
        }
      } else {
        searchParams.set(params.type, params.query);
      }
      navigate(`${location.pathname}?${searchParams.toString()}`, {
        replace: false,
      });
      return;
    }

    navigate(`${location.pathname}`, { replace: false });
  };

  const categoryDropdown = useMemo(() => {
    if (!categories.length) return null;

    let mainCategory = category;
    let categoryObj = [...categories].find(
      (c) => c.name.toLocaleLowerCase() === category
    ) as CategoryMicro;
    let categoryItems = [...categories].filter(
      (c) => c.parent.toLocaleLowerCase() === category
    );
    let parent = "";
    if (categoryObj) {
      if (!categoryItems.length) {
        categoryItems = [...categories].filter(
          (c) => c.parent === categoryObj.parent
        );
        mainCategory = categoryObj.parent;
        categoryObj = [...categories].find(
          (c) =>
            c.name.toLocaleLowerCase() ===
            categoryObj.parent.toLocaleLowerCase()
        ) as CategoryMicro;
      }
      parent = categoryObj.parent;
    }

    const items = [
      {
        title: "Browse Categories",
        pos: "m",
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
              onNavLinkChange({
                type: CatalogQuery.Category,
                query: category === mainCategory ? parent : mainCategory,
              });
            },
            items: categoryItems.map((c) => ({
              title: c.name,
              borderBottom: true,
              onClick: () => {
                onNavLinkChange({ type: CatalogQuery.Category, query: c.name });
              },
            })),
            initSelectedItems:
              mainCategory === category
                ? []
                : [
                    `${categoryItems.findIndex(
                      (c) => c.name.toLocaleLowerCase() === category
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

  return (
    <div className={Styles.filters}>
      <section>{categoryDropdown}</section>
    </div>
  );
}

export default Filters;
