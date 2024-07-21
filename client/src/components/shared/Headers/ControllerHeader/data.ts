import {
  CreatePrdSections,
  PageSections,
  ControllerPaths,
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
    id: ControllerPaths.DashBoard,
    link: () => `/controller/${ControllerPaths.DashBoard}`,
  },
  {
    title: "Users",
    id: ControllerPaths.Users,
    link: () => `/controller/${ControllerPaths.Users}`,
  },
  {
    title: "Categories",
    id: ControllerPaths.Categories,
    link: () => `/controller/${ControllerPaths.Categories}`,
    childPos: "r-m",
    items: [
      {
        title: "All Categories",
        id: PageSections.CatListing,
        link: () =>
          `/controller/${ControllerPaths.Categories}/${PageSections.CatListing}`,
        items: [],
      },
      {
        title: "Add Category",
        id: PageSections.CreateCat,
        link: () =>
          `/controller/${ControllerPaths.Categories}/${PageSections.CreateCat}`,
        items: [],
      },
    ],
  },
  {
    title: "Products",
    id: ControllerPaths.Products,
    link: () => `/controller/${ControllerPaths.Products}`,
    childPos: "r-m",
    items: [
      {
        title: "All Products",
        id: PageSections.PrdListing,
        link: () =>
          `/controller/${ControllerPaths.Products}/${PageSections.PrdListing}`,
      },
      {
        title: "Add Product",
        id: PageSections.CreatePrd,
        link: () =>
          `/controller/${ControllerPaths.Products}/${PageSections.CreatePrd}`,
        items: [
          {
            title: "Category And Brand",
            link: () => {
              const prdId = getParam("prd_id");
              return `/controller/${ControllerPaths.Products}/${
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
              return `/controller/${ControllerPaths.Products}/${
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
    link: () => `/controller/${ControllerPaths.Brand}`,
    id: ControllerPaths.Brand,
    items: [
      {
        title: "All Brands",
        id: PageSections.BrdListing,
        link: () =>
          `/controller/${ControllerPaths.Brand}/${PageSections.BrdListing}`,
      },
      {
        title: "Add Brand",
        id: PageSections.CreateBrd,
        link: () =>
          `/controller/${ControllerPaths.Brand}/${PageSections.CreateBrd}`,
      },
    ],
  },
  {
    title: "Orders",
    childPos: "r-m",
    link: () => `/controller/${ControllerPaths.Orders}`,
    id: ControllerPaths.Orders,
    items: [
      {
        title: "Order Items",
        id: PageSections.OrdListings,
        link: () =>
          `/controller/${ControllerPaths.Orders}/${PageSections.OrdListings}`,
      },
    ],
  },
];

export default data;
