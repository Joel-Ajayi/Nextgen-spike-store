import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";
import {
  CategoryMini,
  InitialCategoryController,
  InitialProductController,
} from "../../types/category";

export const initialState: InitialProductController = {
  newProduct: {
    category: {
      name: "",
      path: "",
    },
    brand: "",
    info: {
      name: "",
      description: "",
      price: 0,
      images: [],
      colors: [],
      mfgCountry: "",
      mfgDate: "",
      discount: 0,
      paymentMethods: [],
      warranty: {
        covered: "",
        duration: 0,
      },
    },
  },
};

const controllerPrdSlice = createSlice({
  name: "ControllerProduct",
  initialState,
  reducers: {},
});

export default controllerPrdSlice;
