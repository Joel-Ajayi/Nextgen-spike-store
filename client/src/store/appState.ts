import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  IAppInitailState,
  IMessage,
  LandingPageData,
  StatusCodes,
} from "../types";
import { DropdownItemProps } from "../components/shared/Dropdown/DropdownItem/DropdownItem";

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
    hotDeals: [],
    popularProducts: [],
    banners: [],
    offers: [],
    topCategories: [null, null, null, null, null, null, null, null, null, null],
    newProducts: [],
    categories: [],
  },
  headerDropDown: [],
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
    setHeaderDropDown: (
      state,
      action: PayloadAction<DropdownItemProps[][]>
    ) => {
      return { ...state, headerDropDown: action.payload };
    },
  },
});

export default appSlice;
