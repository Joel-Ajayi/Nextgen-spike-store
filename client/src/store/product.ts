import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../types/product";

export const initProduct: Product = {
  id: "",
  cId: -1,
  brand: "",
  features: [],
  name: "",
  description: "",
  price: 0,
  images: [],
  colours: [],
  count: 0,
  mfgDate: "",
  discount: 0,
  rating: 0,
  numReviews: 0,
  numSold: 0,
  paymentType: 0,
  warrCovered: "",
  warrDuration: 0,
};

const productSlice = createSlice({
  name: "Product",
  initialState: initProduct,
  reducers: {
    setProduct: (_, action: PayloadAction<Product>) => {
      return action.payload;
    },
  },
});

export default productSlice;
