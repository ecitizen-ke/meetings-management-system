import {
  hideNotification,
  showNotification,
} from '../redux/features/notifications/notificationSlice';

export const handleApiError = (error, dispatch) => {
  const errorMsg =
    error.response?.data?.message ||
    error.response?.data?.error ||
    'An error occurred';
  dispatch(showNotification({ message: errorMsg, type: 'error' }));
  setTimeout(() => dispatch(hideNotification()), 15000);
};
