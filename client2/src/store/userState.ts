import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUserInitailState } from "../types/user";

const initialState: IUserInitailState = {
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
    setUserState: (state, action: PayloadAction<IUserInitailState>) => {
      state = action.payload;
    },
    resetUserState: (state) => {
      state = initialState;
    },
  },
});

export default userSlice;
