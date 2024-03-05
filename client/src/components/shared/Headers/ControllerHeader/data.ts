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
    link: () => `/controller?pg=${Pages.DashBoard}`,
  },
  {
    title: "Categories",
    id: Pages.Categories,
    link: () => `/controller?pg=${Pages.Categories}`,
    items: [
      {
        title: "All Categories",
        id: PageSections.CatListing,
        link: () =>
          `/controller?pg=${Pages.Categories}&sec=${PageSections.CatListing}`,
        items: [],
      },
      {
        title: "Add Category",
        id: PageSections.CreateCat,
        link: () =>
          `/controller?pg=${Pages.Categories}&sec=${PageSections.CreateCat}`,
        items: [],
      },
    ],
  },
  {
    title: "Products",
    id: Pages.Products,
    link: () => `/controller?pg=${Pages.Products}`,
    items: [
      {
        title: "All Products",
        id: PageSections.PrdListing,
        link: () =>
          `/controller?pg=${Pages.Products}&sec=${PageSections.PrdListing}`,
      },
      {
        title: "Add Product",
        id: PageSections.CreatePrd,
        link: () =>
          `/controller?pg=${Pages.Products}&sec=${PageSections.CreatePrd}`,
        items: [
          {
            title: "Category And Brand",
            link: () => {
              const prdId = getParam("prd_id");
              return `/controller?pg=${Pages.Products}&sec=${
                PageSections.CreatePrd
              }&sub=${CreatePrdSections.CategoryAndBrand}${
                prdId ? `&prd_id=${prdId}` : ""
              }`;
            },
            id: CreatePrdSections.CategoryAndBrand,
          },
          {
            title: "Product Info",
            link: () => {
              const prdId = getParam("prd_id");
              return `/controller?pg=${Pages.Products}&sec=${
                PageSections.CreatePrd
              }&sub=${CreatePrdSections.ProductInfo}${
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
    link: () => `/controller?pg=${Pages.Brand}`,
    id: Pages.Brand,
    items: [
      {
        title: "All Brands",
        id: PageSections.BrdListing,
        link: () =>
          `/controller?pg=${Pages.Brand}&sec=${PageSections.BrdListing}`,
      },
      {
        title: "Add Brand",
        id: PageSections.CreateBrd,
        link: () =>
          `/controller?pg=${Pages.Brand}&sec=${PageSections.CreateBrd}`,
      },
    ],
  },
  {
    title: "Orders",
    link: () => `/controller?pg=${Pages.Orders}`,
    id: Pages.Orders,
    items: [
      {
        title: "Order Items",
        id: PageSections.OrdListings,
        link: () =>
          `/controller?pg=${Pages.Orders}&sec=${PageSections.OrdListings}`,
      },
    ],
  },
];

export default data;
