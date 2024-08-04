import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { APIPagination, Pagination } from "../types";
import {
  CatalogStateAPI,
  CatalogStateType,
  ProductMini,
} from "../types/product";

export const initialCatalogState: CatalogStateType = {
  isParamsUpdated: true,
  offers: [],
  products: {
    page: 1,
    list: { 0: [null, null, null, null, null, null, null, null] },
    count: 16,
    skip: 0,
    take: 16,
    numPages: 1,
  },
  brands: [],
  filters: [],
};

const catalogSlice = createSlice({
  name: "Catalog",
  initialState: initialCatalogState,
  reducers: {
    setCatalog: (state, action: PayloadAction<CatalogStateAPI>) => {
      return {
        ...action.payload,
        products: {
          ...action.payload.products,
          list: {
            ...state.products.list,
            [action.payload.products.page]: action.payload.products.list,
          },
        },
        isParamsUpdated: false,
      };
    },
    onPaginate: (state, action: PayloadAction<APIPagination<ProductMini>>) => {
      const list = {
        ...state.products.list,
        [action.payload.page]: action.payload.list,
      };
      return { ...state, products: { ...action.payload, list } };
    },
    setIsParamsUpdated: (state, action: PayloadAction<boolean>) => {
      return { ...state, isParamsUpdated: action.payload };
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
