import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";
import { Brand } from "../../types";

export const initialState: Brand[] = [];

const brandSlice = createSlice({
  name: "BrandSlice",
  initialState,
  reducers: {
    setBrands: (_, action: PayloadAction<Brand[]>) => {
      return action.payload;
    },
    addBrand: (state, action: PayloadAction<Brand>) => {
      return [...state, action.payload];
    },
    updateBrand: (
      state,
      action: PayloadAction<{ index: number; brd: Brand }>
    ) => {
      const newBrands = cloneDeep(state);
      newBrands[action.payload.index] = action.payload.brd;
      return newBrands;
    },
  },
});

export default brandSlice;
