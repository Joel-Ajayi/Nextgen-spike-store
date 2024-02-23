import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";
import uniqId from "uniqid";
import {
  Category,
  CategoryBanner,
  CategoryFeature,
  CategoryFormData,
  CategoryMini,
  CategoryOffer,
  InitialCategoryController,
} from "../../types/category";
import { IFile } from "../../types";

export const defaultFeature: CategoryFeature = {
  id: uniqId(),
  name: "",
  parentId: null,
  type: 0,
  options: [],
  useAsFilter: false,
};

export const defaultOffer: CategoryOffer = {
  id: uniqId(),
  discount: 1,
  audience: 0,
  bannerColours: ["#FFFFFF"],
  tagline: "",
  validUntil: `01-01-${new Date().getFullYear()}`,
  image: "",
  type: 0,
};

export const defaultBanner = {
  image: null,
  tagline: "",
  bannerColours: ["#FFFFFF"],
};

export const defaultCategory: Category = {
  id: undefined,
  name: "",
  brand: "",
  description: "",
  icon: null,
  parent: "",
  banner: defaultBanner,
  offers: [],
  features: [],
  hasWarrantyAndProduction: false,
};

export const initialState: InitialCategoryController = {
  categories: [],
  category: defaultCategory,
  formData: {
    brands: [],
    offerTypes: [],
    featureTypes: [],
    offerAudiences: [],
  },
};

const controllerCatSlice = createSlice({
  name: "ControllerCategory",
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<CategoryFormData>) => {
      return { ...state, formData: action.payload };
    },
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
      return { ...state, category: action.payload };
    },
    setCategoryInput: (
      state,
      action: PayloadAction<{
        value:
          | string
          | (IFile | number | string | CategoryFeature | CategoryOffer)[]
          | IFile
          | number
          | boolean
          | CategoryBanner
          | undefined
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
