import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUserInitailState } from "../types/user";

export const initialState: IUserInitailState = {
  isAuthenticated: false,
  email: "",
  lName: "",
  fName: "",
  username: "",
  avatar: null,
  role: null,
  contactNumber: null,
};

const userSlice = createSlice({
  name: "User",
  initialState,
  reducers: {
    setUserState: (_, action: PayloadAction<IUserInitailState>) => {
      return action.payload;
    },
    resetUserState: () => {
      return initialState;
    },
  },
});

export default userSlice;
