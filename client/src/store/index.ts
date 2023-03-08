import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./appState";
import { controller } from "./controller";
import userSlice from "./userState";

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    app: appSlice.reducer,
    controller: controller,
  },
  devTools: true,
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
