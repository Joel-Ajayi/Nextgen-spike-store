import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Cart, CartItem, CartPageData } from "../types/product";
import helpers from "../helpers";

export const cartInitialState: Cart = {
  items: [],
  shippingAmount: 0,
  subTotalAmount: 0,
  totalAmount: 0,
  paymentMethods: [],
  paymentMethod: 0,
  isCheckout: false,
};

const cartSlice = createSlice({
  name: "Cart",
  initialState: cartInitialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartPageData | Cart>) => {
      return { ...state, ...action.payload };
    },
    addItemToCart: (state, action: PayloadAction<string>) => {
      let subTotalAmount = 0;
      const newQty = helpers.getCartItem(action.payload).qty;
      const items = ([...state.items] as CartItem[])
        .filter(({ id, qty, discountPrice }) => {
          if (id === action.payload) {
            subTotalAmount += discountPrice * newQty;
            return newQty !== 0;
          }
          subTotalAmount += discountPrice * qty;
          return true;
        })
        .map(({ qty, ...item }) => ({
          ...item,
          qty: item.id === action.payload ? newQty : qty,
        }));

      return {
        ...state,
        subTotalAmount,
        totalAmount: subTotalAmount + state.shippingAmount,
        items,
      };
    },
    setPaymentMethod: (state, action: PayloadAction<number>) => {
      return { ...state, paymentMethod: action.payload };
    },
    setIsLoadingCart: (state) => {
      return { ...state, items: helpers.getCart().map(() => null) };
    },
    setIsCheckout: (state) => {
      return { ...state, isCheckout: true };
    },
  },
});

export default cartSlice;
