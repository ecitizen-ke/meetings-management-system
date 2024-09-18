import {
  hideNotification,
  showNotification,
} from "../redux/features/notifications/notificationSlice";

export const showMessage = (msg, type, dispatch) => {
  dispatch(showNotification({ message: msg, type }));
  setTimeout(() => dispatch(hideNotification()), 3000);
};
