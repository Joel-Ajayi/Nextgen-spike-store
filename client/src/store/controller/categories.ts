import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";
import uniqId from "uniqid";
import {
  Category,
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
  validUntil: `01-01-${new Date().getFullYear()}`,
  banner: "",
  type: 0,
};

export const initialState: InitialCategoryController = {
  categories: [],
  formData: {
    brands: [],
    offerTypes: [],
    featureTypes: [],
    offerAudiences: [],
  },
  category: {
    id: undefined,
    name: "",
    brand: "",
    description: "",
    parent: "",
    image: [],
    offers: [],
    features: [defaultFeature],
    hasWarrantyAndProduction: false,
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
      const newIds = action.payload.features.map((f) => f.id);
      const prevFeatures = state.category.features.filter(
        (f) => !newIds.includes(f.id)
      );

      const offers = !action.payload.offers.length
        ? [defaultOffer]
        : action.payload.offers;

      return {
        ...state,
        category: {
          ...state.category,
          ...action.payload,
          features: [...prevFeatures, ...action.payload.features],
          offers,
        },
      };
    },
    setCatgeoryInput: (
      state,
      action: PayloadAction<{
        value:
          | string
          | (IFile | number | string | CategoryFeature | CategoryOffer)[]
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
