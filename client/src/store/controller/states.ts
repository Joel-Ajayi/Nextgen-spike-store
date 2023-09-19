import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CSSProperties } from "react";

export const initialState: {
  showSideBar: Boolean;
  activeTabs: string[];
  sideBarWrapperStyle: CSSProperties;
  sideBarStyle: CSSProperties;
} = {
  showSideBar: false,
  activeTabs: [""],
  sideBarWrapperStyle: {},
  sideBarStyle: {},
};

const stateSlice = createSlice({
  name: "StateSlice",
  initialState,
  reducers: {
    setSideBarState: (state, action: PayloadAction<Boolean>) => {
      return { ...state, showSideBar: action.payload };
    },
    setActiveTabs: (state, action: PayloadAction<string[]>) => {
      return { ...state, activeTabs: action.payload };
    },
    setSideBarWrapperStyle: (state, action: PayloadAction<CSSProperties>) => {
      return { ...state, sideBarWrapperStyle: action.payload };
    },
    setSideBarStyle: (state, action: PayloadAction<CSSProperties>) => {
      return { ...state, sideBarStyle: action.payload };
    },
  },
});

export default stateSlice;
