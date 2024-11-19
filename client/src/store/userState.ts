import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUserInitailState } from "../types/user";
import uniqid from "uniqid";

export const initialState: IUserInitailState & { selectedAddress: string } = {
  isAuthenticated: false,
  email: "",
  roles: [0],
  fName: "",
  lName: "",
  avatar: null,
  contactNumber: null,
  addressTypes: [],
  addresses: [],
  states: [],
  selectedAddress: "",
};

const userSlice = createSlice({
  name: "User",
  initialState,
  reducers: {
    setUserState: (_, action: PayloadAction<IUserInitailState>) => {
      return { ...action.payload, selectedAddress: "" };
    },
    resetUserState: () => {
      return initialState;
    },
    setSelectedAddress: (state, action: PayloadAction<string>) => {
      return { ...state, selectedAddress: action.payload };
    },
    addAddress: (state) => {
      return {
        ...state,
        addresses: [
          ...state.addresses,
          {
            id: uniqid(),
            isNew: true,
            name: "",
            tel: "",
            state: state.states[0].name,
            city: state.states[0].cities[0].name,
            locality: state.states[0].cities[0].localities[0],
            address: "",
            addressType: 0,
          },
        ],
      };
    },
    updateAddress: (
      state,
      action: PayloadAction<{ id: string; name: string; value: any }>
    ) => {
      return {
        ...state,
        addresses: [
          ...state.addresses.map((a) =>
            a.id === action.payload.id
              ? {
                  ...a,
                  isNew: action.payload.name === "id" ? false : a.isNew,
                  [action.payload.name]: action.payload.value,
                }
              : a
          ),
        ],
      };
    },
    deleteAddress: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        addresses: [...state.addresses.filter((_, i) => i !== action.payload)],
      };
    },
  },
});

export default userSlice;
