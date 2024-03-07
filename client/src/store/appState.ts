import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  IAppInitailState,
  IMessage,
  LandingPageData,
  StatusCodes,
} from "../types";
import { DropdownItemProps } from "../components/shared/Dropdown/DropdownItem/DropdownItem";
import { DropdownProps } from "../components/shared/Dropdown/Dropdown";

export const initialState: IAppInitailState = {
  showModal: false,
  isLoading: true,
  isPageLoading: true,
  requestTimeout: false,
  networkError: false,
  statusCode: 200,
  message: {
    header: "",
    msg: "",
    statusCode: StatusCodes.Ok,
    type: null,
    transitionFrom: "",
  },
  landingPageData: {
    banners: [],
    offers: [null, null],
    categories: [],
    topCategories: [null, null, null, null, null, null, null, null, null, null],
    newProducts: [null, null, null, null, null],
    hotDeals: [null, null, null, null, null],
    popularProducts: [null, null, null, null, null],
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
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      return { ...state, isPageLoading: action.payload };
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
    setStatusCode: (state, action: PayloadAction<number>) => {
      return { ...state, statusCode: action.payload };
    },
    setLandingPageData: (state, action: PayloadAction<LandingPageData>) => {
      return { ...state, landingPageData: action.payload };
    },
  },
});

export default appSlice;
