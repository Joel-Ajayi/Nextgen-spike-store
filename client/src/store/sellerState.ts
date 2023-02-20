import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ISellerInitailState } from "../types";

export const initialState: ISellerInitailState = {
  isAuthenticated: false,
  email: "",
  fullName: "",
  displayName: "",
  businessName: "",
  avatar: null,
  role: 0,
  contactNumber: null,
};

const sellerSlice = createSlice({
  name: "Seller",
  initialState,
  reducers: {
    setSellerState: (_, action: PayloadAction<ISellerInitailState>) => {
      return action.payload;
    },
    resetSellerState: () => {
      return initialState;
    },
  },
});

export default sellerSlice;
