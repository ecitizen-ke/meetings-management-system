import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import qrReducer from "./features/qr/Qr";
import notificationReducer from "./features/notifications/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    qr: qrReducer,
    notification: notificationReducer,
  },
});
