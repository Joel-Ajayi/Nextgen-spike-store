import {
  CreatePrdSections,
  PageSections,
  Pages,
} from "../../../../types/controller";

export type DataType = {
  items: { [key in string]: DataType };
  title: string;
  link: () => string;
  id: string;
};

const getParam = (param: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

const data: { [key in string]: DataType } = {
  [Pages.DashBoard]: {
    title: "Dashboard",
    id: Pages.DashBoard,
    link: () => `/controller?pg=${Pages.DashBoard}`,
    items: {},
  },
  [Pages.Categories]: {
    title: "Categories",
    id: Pages.Categories,
    link: () => `/controller?pg=${Pages.Categories}`,
    items: {
      [PageSections.CatListing]: {
        title: "All Categories",
        id: PageSections.CatListing,
        link: () =>
          `/controller?pg=${Pages.Categories}&sec=${PageSections.CatListing}`,
        items: {},
      },
      [PageSections.CreateCat]: {
        title: "Add Category",
        id: PageSections.CreateCat,
        link: () =>
          `/controller?pg=${Pages.Categories}&sec=${PageSections.CreateCat}`,
        items: {},
      },
    },
  },
  [Pages.Products]: {
    title: "Products",
    id: Pages.Products,
    link: () => `/controller?pg=${Pages.Products}`,
    items: {
      [PageSections.PrdListing]: {
        title: "All Products",
        id: PageSections.PrdListing,
        link: () =>
          `/controller?pg=${Pages.Products}&sec=${PageSections.PrdListing}`,
        items: {},
      },
      [PageSections.CreatePrd]: {
        title: "Add Product",
        id: PageSections.CreatePrd,
        link: () =>
          `/controller?pg=${Pages.Products}&sec=${PageSections.CreatePrd}`,
        items: {
          [CreatePrdSections.CategoryAndBrand]: {
            title: "Category And Brand",
            link: () => {
              const prdId = getParam("prd_id");
              return `/controller?pg=${Pages.Products}&sec=${
                PageSections.CreatePrd
              }&sub=${CreatePrdSections.CategoryAndBrand}${
                prdId ? `&prd_id=${prdId}` : ""
              }`;
            },
            items: {},
            id: CreatePrdSections.CategoryAndBrand,
          },
          [CreatePrdSections.ProductInfo]: {
            title: "Product Info",
            link: () => {
              const prdId = getParam("prd_id");
              return `/controller?pg=${Pages.Products}&sec=${
                PageSections.CreatePrd
              }&sub=${CreatePrdSections.ProductInfo}${
                prdId ? `&prd_id=${prdId}` : ""
              }`;
            },
            items: {},
            id: CreatePrdSections.ProductInfo,
          },
        },
      },
    },
  },
  [Pages.Brand]: {
    title: "Brands",
    link: () => `/controller?pg=${Pages.Brand}`,
    id: Pages.Brand,
    items: {
      [PageSections.BrdListing]: {
        title: "All Brands",
        id: PageSections.BrdListing,
        link: () =>
          `/controller?pg=${Pages.Brand}&sec=${PageSections.BrdListing}`,
        items: {},
      },
      [PageSections.CreateBrd]: {
        title: "Add Brand",
        id: PageSections.CreateBrd,
        link: () =>
          `/controller?pg=${Pages.Brand}&sec=${PageSections.CreateBrd}`,
        items: {},
      },
    },
  },
  [Pages.Orders]: {
    title: "Orders",
    link: () => `/controller?pg=${Pages.Orders}`,
    id: Pages.Orders,
    items: {
      [PageSections.OrdListings]: {
        title: "Order Items",
        id: PageSections.OrdListings,
        link: () =>
          `/controller?pg=${Pages.Orders}&sec=${PageSections.OrdListings}`,
        items: {},
      },
    },
  },
};

export default data;
