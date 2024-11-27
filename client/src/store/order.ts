import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { APIPagination, Pagination } from "../types";
import { Order, OrderMini } from "../types/product";

export const initialState: {
  orders: Pagination<OrderMini | null>;
  order: Order | null;
} = {
  order: null,
  orders: {
    skip: 0,
    list: { 0: [null, null, null, null, null, null] },
    count: 0,
    page: 1,
    numPages: 1,
    take: 16,
  },
};

const ordersSlice = createSlice({
  name: "OrdersSlice",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<APIPagination<OrderMini>>) => {
      return {
        ...state,
        orders: {
          ...action.payload,
          list: {
            [action.payload.page]: action.payload.list,
          },
        },
      };
    },
    onPaginateOrders: (
      state,
      action: PayloadAction<APIPagination<OrderMini>>
    ) => {
      return {
        ...state,
        orders: {
          ...action.payload,
          list: {
            ...state.orders.list,
            [action.payload.page]: action.payload.list,
          },
        },
      };
    },
    setOrder: (state, action: PayloadAction<Order | null>) => {
      return { ...state, order: action.payload };
    },
    setOrderPayStatus: (state, action: PayloadAction<number>) => {
      if (state.order) {
        return {
          ...state,
          order: {
            ...state.order,
            payStatuses: {
              ...state.order.payStatuses.map((s, index) =>
                index <= action.payload
                  ? {
                      ...s,
                      ok: true,
                      createdAt:
                        index === action.payload
                          ? new Date().toDateString()
                          : s.createdAt,
                    }
                  : s
              ),
            },
          },
        };
      }
      return state;
    },
    onPaginate: (state, action: PayloadAction<APIPagination<OrderMini>>) => {
      const list = {
        ...state.orders.list,
        [action.payload.page]: action.payload.list,
      };
      return { ...state, products: { ...action.payload, list } };
    },
    setPage: (state, action: PayloadAction<{ skip: number; page: number }>) => {
      return {
        ...state,
        orders: {
          ...state.orders,
          skip: action.payload.skip,
          page: action.payload.page,
        },
      };
    },
  },
});

export default ordersSlice;
