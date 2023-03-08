import { combineReducers, configureStore } from "@reduxjs/toolkit";
import controllerCatSlice from "./categories";

export const controller = combineReducers({
  category: controllerCatSlice.reducer,
});
