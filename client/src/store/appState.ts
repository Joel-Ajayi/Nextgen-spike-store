import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IAppInitailState, IMessage } from "../types";

export const initialState: IAppInitailState = {
  showModal: false,
  isLoading: true,
  requestTimeout: false,
  networkError: false,
  message: {
    header: "",
    msg: "",
    type: null,
    transitionFrom: "",
  },
};

const appSlice = createSlice({
  name: "App",
  initialState,
  reducers: {
    setShowModal: (state, action: PayloadAction<boolean>) => {
      return { ...state, showModal: action.payload };
    },
    setAppLoading: (state, action: PayloadAction<boolean>) => {
      return { ...state, isLoading: action.payload };
    },
    setAppRequestTimeout: (state, action: PayloadAction<boolean>) => {
      return { ...state, requestTimeout: action.payload };
    },
    setNetworkError: (state, action: PayloadAction<boolean>) => {
      return { ...state, networkError: action.payload };
    },
    setBackgroundMsg: (state, action: PayloadAction<IMessage>) => {
      return { ...state, message: action.payload };
    },
  },
});

export default appSlice;
