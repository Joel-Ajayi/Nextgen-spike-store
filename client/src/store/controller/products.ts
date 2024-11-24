import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  ProductFeature,
  InitialProductController,
  ProductFormData,
  Product,
  ProductMini2,
  ProductInput,
} from "../../types/product";
import { APIPagination, IFile } from "../../types";
import { CategoryFeature, CategoryMini } from "../../types/category";

export const initControllerProduct: ProductInput = {
  id: undefined,
  cId: -1,
  brand: "",
  isValid: [],
  features: [],
  initFeatures: [],
  name: "",
  description: "",
  price: 0,
  images: [],
  colours: [],
  numReviews: 0,
  numSold: 0,
  rating: 0,
  count: 0,
  mfgDate: "",
  discount: 0,
  paymentType: 0,
  warrCovered: "",
  warrDuration: 0,
};

export const initialState: InitialProductController = {
  formData: {
    categories: [],
    categoriesPath: [],
    brands: [],
    paymentTypes: [],
    features: [],
    featureTypes: [],
  },
  product: initControllerProduct,
  list: {
    skip: 0,
    list: { 1: [] },
    count: 16,
    page: 1,
    numPages: 1,
    take: 16,
  },
};

const controllerPrdSlice = createSlice({
  name: "ControllerProduct",
  initialState,
  reducers: {
    setProductFormData: (state, action: PayloadAction<ProductFormData>) => {
      return {
        ...state,
        formData: action.payload,
      };
    },
    setProductFormFeatures: (
      state,
      action: PayloadAction<CategoryFeature[]>
    ) => {
      return {
        ...state,
        formData: { ...state.formData, features: action.payload },
      };
    },
    setInitProductInput: (state, action: PayloadAction<Product>) => {
      return {
        ...state,
        product: {
          ...state.product,
          ...action.payload,
          initFeatures: action.payload.features,
        },
      };
    },
    setProductInput: (
      state,
      action: PayloadAction<{
        value:
          | string
          | (IFile | number | string | ProductFeature)[]
          | boolean
          | number
          | null;
        name: string;
      }>
    ) => {
      return {
        ...state,
        product: {
          ...state.product,
          [action.payload.name]: action.payload.value,
        },
      };
    },
    setCategoryListPath: (state, action: PayloadAction<string[]>) => {
      return {
        ...state,
        formData: {
          ...state.formData,
          categoriesPath: action.payload,
        },
      };
    },
    setCategoryList: (state, action: PayloadAction<CategoryMini[]>) => {
      return {
        ...state,
        formData: { ...state.formData, categories: action.payload },
      };
    },
    setProductInputValidity: (state, action: PayloadAction<boolean[]>) => {
      return {
        ...state,
        product: { ...state.product, isValid: action.payload },
      };
    },
    setProductList: (
      state,
      action: PayloadAction<APIPagination<ProductMini2>>
    ) => {
      const list = {
        ...state.list.list,
        [action.payload.page]: action.payload.list,
      };
      return { ...state, list: { ...action.payload, list } };
    },
    setPage: (state, action: PayloadAction<{ skip: number; page: number }>) => {
      return {
        ...state,
        list: {
          ...state.list,
          skip: action.payload.skip,
          page: action.payload.page,
        },
      };
    },
  },
});

export default controllerPrdSlice;
