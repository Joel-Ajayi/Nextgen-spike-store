import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { APIPagination, Pagination } from "../types";
import {
  CatalogStateAPI,
  CatalogStateType,
  ProductMini,
} from "../types/product";

export const initialCatalogState: CatalogStateType = {
  offers: [],
  price: "",
  products: {
    page: 1,
    list: { 1: [null, null, null, null, null, null, null, null, null, null] },
    count: 10,
    skip: 0,
    take: 2,
    numPages: 1,
  },
  brands: [],
  filters: [],
};

const catalogSlice = createSlice({
  name: "Catalog",
  initialState: initialCatalogState,
  reducers: {
    setCatalog: (_, action: PayloadAction<CatalogStateAPI>) => {
      return {
        ...action.payload,
        products: {
          ...action.payload.products,
          list: {
            [action.payload.products.page]: action.payload.products.list,
          },
        },
        isCategoryChanged: false,
      };
    },
    onPaginate: (state, action: PayloadAction<APIPagination<ProductMini>>) => {
      const list = {
        ...state.products.list,
        [action.payload.page]: action.payload.list,
      };
      return { ...state, products: { ...action.payload, list } };
    },
    setPage: (state, action: PayloadAction<{ skip: number; page: number }>) => {
      return {
        ...state,
        products: {
          ...state.products,
          skip: action.payload.skip,
          page: action.payload.page,
        },
      };
    },
  },
});

export default catalogSlice;
