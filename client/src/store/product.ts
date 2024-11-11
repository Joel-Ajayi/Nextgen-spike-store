import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product, ProductReview, ProductReviews } from "../types/product";
import { APIPagination } from "../types";

export const initProduct: Product & ProductReviews = {
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
  reviews: {
    page: 1,
    list: [],
    count: 16,
    skip: 0,
    take: 16,
    numPages: 1,
  },
};

const productSlice = createSlice({
  name: "Product",
  initialState: initProduct,
  reducers: {
    setProduct: (_, action: PayloadAction<Product>) => {
      return { ..._, ...action.payload };
    },
    setReviews: (
      state,
      action: PayloadAction<APIPagination<ProductReview>>
    ) => {
      return {
        ...state,
        reviews: {
          ...action.payload,
          list: [...state.reviews.list, ...action.payload.list],
        },
      };
    },
    setReview: (
      state,
      action: PayloadAction<{ review: ProductReview; index: number }>
    ) => {
      const list = [...state.reviews.list];
      list[action.payload.index] = action.payload.review;
      return {
        ...state,
        reviews: { ...state.reviews, list },
      };
    },
  },
});

export default productSlice;
