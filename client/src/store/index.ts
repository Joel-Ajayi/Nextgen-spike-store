import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./appState";
import { controller } from "./controller";
import userSlice from "./userState";
import brandSlice from "./controller/brands";
import catalogSlice from "./catalog";
import productSlice from "./product";

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    app: appSlice.reducer,
    brands: brandSlice.reducer,
    controller: controller,
    catalog: catalogSlice.reducer,
    product: productSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
  devTools: true,
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const dispatch = store.dispatch;
export default store;
