import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./appState";
import { controller } from "./controller";
import userSlice from "./userState";
import brandSlice from "./controller/brand";

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    app: appSlice.reducer,
    brands: brandSlice.reducer,
    controller: controller,
  },
  devTools: true,
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
