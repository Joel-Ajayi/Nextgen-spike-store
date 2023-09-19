import { combineReducers } from "@reduxjs/toolkit";
import controllerCatSlice from "./categories";
import controllerStateSlice from "./states";
import controllerPrdSlice from "./product";

export const controller = combineReducers({
  category: controllerCatSlice.reducer,
  state: controllerStateSlice.reducer,
  product: controllerPrdSlice.reducer,
});
