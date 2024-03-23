import { PayloadAction, configureStore } from "@reduxjs/toolkit";
import appSlice from "./appState";
import { controller } from "./controller";
import userSlice from "./userState";
import brandSlice from "./controller/brands";
import productsSlice from "./products";

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    app: appSlice.reducer,
    brands: brandSlice.reducer,
    controller: controller,
    products: productsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
  devTools: true,
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const dispatch = store.dispatch;
export default store;
