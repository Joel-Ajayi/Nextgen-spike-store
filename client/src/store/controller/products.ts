import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  ProductFeature,
  InitialProductController,
  ProductFormData,
  Product,
  ProductMini2,
} from "../../types/product";
import { IFile, Pagination } from "../../types";
import { CategoryFeature, CategoryMini } from "../../types/category";

export const initialState: InitialProductController = {
  formData: {
    categories: [],
    categoriesPath: [],
    brands: [],
    paymentTypes: [],
    colours: [],
    features: [],
  },
  product: {
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
    count: 0,
    mfgDate: 2010,
    discount: 0,
    paymentType: 0,
    warrCovered: "",
    warrDuration: 1,
  },
  list: {
    skip: 0,
    list: [],
    count: 0,
    page: 1,
    numPages: 1,
    take: 30,
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
      action: PayloadAction<Pagination<ProductMini2>>
    ) => {
      {
        return { ...state, list: action.payload };
      }
    },
  },
});

export default controllerPrdSlice;
