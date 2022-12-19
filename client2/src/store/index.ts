import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userState";

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
  devTools: true,
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
