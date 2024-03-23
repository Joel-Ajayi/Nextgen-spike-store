import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Pagination } from "../types";
import { ProductMini } from "../types/product";

export const initialProductsState: Pagination<ProductMini> = {
  skip: 0,
  list: [],
  count: 0,
  page: 1,
  numPages: 1,
  take: 20,
};

const productsSlice = createSlice({
  name: "Products",
  initialState: initialProductsState,
  reducers: {
    setProducts: (_, action: PayloadAction<Pagination<ProductMini>>) => {
      return action.payload;
    },
  },
});

export default productsSlice;
