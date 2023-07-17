import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";
import { CategoryMini, InitialCategoryController } from "../../types/category";

export const initialState: InitialCategoryController = {
  categories: [],
};

const controllerCatSlice = createSlice({
  name: "ControllerCategory",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<CategoryMini[]>) => {
      return { ...state, categories: action.payload };
    },
    addCategory: (state, action: PayloadAction<CategoryMini>) => {
      return { ...state, categories: [...state.categories, action.payload] };
    },
    updateCategory: (
      state,
      action: PayloadAction<{ index: number; cat: CategoryMini }>
    ) => {
      const newCatList = cloneDeep(state.categories);
      newCatList[action.payload.index] = action.payload.cat;
      return { ...state, categories: newCatList };
    },
  },
});

export default controllerCatSlice;
