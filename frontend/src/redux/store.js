import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import qrReducer from "./features/qr/Qr";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    qr: qrReducer,
  },
});
