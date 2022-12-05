import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({ reducer: {}, devTools: true });

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
