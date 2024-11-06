import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import qrReducer from './features/qr/Qr';
import notificationReducer from './features/notifications/notificationSlice';
import signatureReducer from './features/signature/signatureSlice';
import venueReducer from './features/venue/venueSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    qr: qrReducer,
    notification: notificationReducer,
    signature: signatureReducer,
    venue: venueReducer,
  },
});
