import {
  CreatePrdSections,
  PageSections,
  Pages,
} from "../../../../types/controller";
import { DropdownProps } from "../../Dropdown/Dropdown";

export type DataType = {
  items: { [key in string]: DropdownProps };
  title: string;
  link: () => string;
  id: string;
};

const getParam = (param: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

const data: DropdownProps[] = [
  {
    title: "Dashboard",
    id: Pages.DashBoard,
    link: () => `/controller/${Pages.DashBoard}`,
    childPos: "r-m",
  },
  {
    title: "Users",
    id: Pages.DashBoard,
    childPos: "r-m",
    link: () => `/controller/${Pages.DashBoard}`,
  },
  {
    title: "Categories",
    id: Pages.Categories,
    link: () => `/controller/${Pages.Categories}`,
    childPos: "r-m",
    items: [
      {
        title: "All Categories",
        id: PageSections.CatListing,
        link: () =>
          `/controller/${Pages.Categories}/${PageSections.CatListing}`,
        items: [],
      },
      {
        title: "Add Category",
        id: PageSections.CreateCat,
        link: () => `/controller/${Pages.Categories}/${PageSections.CreateCat}`,
        items: [],
      },
    ],
  },
  {
    title: "Products",
    id: Pages.Products,
    link: () => `/controller/${Pages.Products}`,
    childPos: "r-m",
    items: [
      {
        title: "All Products",
        id: PageSections.PrdListing,
        link: () => `/controller/${Pages.Products}/${PageSections.PrdListing}`,
      },
      {
        title: "Add Product",
        id: PageSections.CreatePrd,
        link: () => `/controller?/${Pages.Products}/${PageSections.CreatePrd}`,
        items: [
          {
            title: "Category And Brand",
            link: () => {
              const prdId = getParam("prd_id");
              return `/controller/${Pages.Products}/${
                PageSections.CreatePrd
              }?sub=${CreatePrdSections.CategoryAndBrand}${
                prdId ? `&prd_id=${prdId}` : ""
              }`;
            },
            id: CreatePrdSections.CategoryAndBrand,
          },
          {
            title: "Product Info",
            link: () => {
              const prdId = getParam("prd_id");
              return `/controller/${Pages.Products}/${
                PageSections.CreatePrd
              }?sub=${CreatePrdSections.ProductInfo}${
                prdId ? `&prd_id=${prdId}` : ""
              }`;
            },
            id: CreatePrdSections.ProductInfo,
          },
        ],
      },
    ],
  },
  {
    title: "Brands",
    childPos: "r-m",
    link: () => `/controller/${Pages.Brand}`,
    id: Pages.Brand,
    items: [
      {
        title: "All Brands",
        id: PageSections.BrdListing,
        link: () => `/controller/${Pages.Brand}/${PageSections.BrdListing}`,
      },
      {
        title: "Add Brand",
        id: PageSections.CreateBrd,
        link: () => `/controller/${Pages.Brand}/${PageSections.CreateBrd}`,
      },
    ],
  },
  {
    title: "Orders",
    childPos: "r-m",
    link: () => `/controller/${Pages.Orders}`,
    id: Pages.Orders,
    items: [
      {
        title: "Order Items",
        id: PageSections.OrdListings,
        link: () => `/controller/${Pages.Orders}/${PageSections.OrdListings}`,
      },
    ],
  },
];

export default data;
