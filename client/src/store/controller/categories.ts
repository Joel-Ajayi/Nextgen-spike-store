import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";
import uniqId from "uniqid";
import {
  Category,
  CategoryFeature,
  CategoryFeatureType,
  CategoryMini,
  InitialCategoryController,
} from "../../types/category";
import { IFile } from "../../types";

export const defaultFeature: CategoryFeature = {
  id: uniqId(),
  name: "",
  parentId: null,
  type: CategoryFeatureType.Text,
  options: [],
  useAsFilter: false,
};

export const initialState: InitialCategoryController = {
  categories: [],
  category: {
    id: undefined,
    name: "",
    brand: "",
    description: "",
    parent: "",
    image: [],
    banners: [],
    features: [defaultFeature],
    hasWarrantyAndProduction: false,
  },
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
    updateCategories: (
      state,
      action: PayloadAction<{ index: number; cat: CategoryMini }>
    ) => {
      const newCatList = cloneDeep(state.categories);
      newCatList[action.payload.index] = action.payload.cat;
      return { ...state, categories: newCatList };
    },
    setInitCategoryInput: (state, action: PayloadAction<Category>) => {
      const newIds = action.payload.features.map((f) => f.id);
      const prevFeatures = state.category.features.filter(
        (f) => !newIds.includes(f.id)
      );

      return {
        ...state,
        category: {
          ...state.category,
          ...action.payload,
          features: [...prevFeatures, ...action.payload.features],
        },
      };
    },
    setCatgeoryInput: (
      state,
      action: PayloadAction<{
        value:
          | string
          | (IFile | number | string | CategoryFeature)[]
          | number
          | boolean
          | null;
        name: string;
      }>
    ) => {
      return {
        ...state,
        category: {
          ...state.category,
          [action.payload.name]: action.payload.value,
        },
      };
    },
  },
});

export default controllerCatSlice;
