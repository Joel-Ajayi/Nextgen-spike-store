import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IAppInitailState } from "../types";

export const initialState: IAppInitailState = {
  showModal: false,
};

const appSlice = createSlice({
  name: "App",
  initialState,
  reducers: {
    setShowModal: (state, action: PayloadAction<boolean>) => {
      return { ...state, showModal: action.payload };
    },
  },
});

export default appSlice;
