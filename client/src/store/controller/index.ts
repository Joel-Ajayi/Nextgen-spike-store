import { combineReducers } from "@reduxjs/toolkit";
import controllerCatSlice from "./categories";
import controllerStateSlice from "./states";
import controllerPrdSlice from "./products";
import controllerOrdersSlice from "./orders";

export const controller = combineReducers({
  categories: controllerCatSlice.reducer,
  state: controllerStateSlice.reducer,
  products: controllerPrdSlice.reducer,
  orders: controllerOrdersSlice.reducer,
});
