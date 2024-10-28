import { jwtDecode } from 'jwt-decode';
import {
  hideNotification,
  showNotification,
} from '../redux/features/notifications/notificationSlice';

export const showMessage = (msg, type, dispatch) => {
  dispatch(showNotification({ message: msg, type }));
  setTimeout(() => dispatch(hideNotification()), 3000);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const checkTokenExpiry = (dispatch) => {
  try {
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);

    // Get current time in seconds (UNIX timestamp)
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if the token is expired
    if (decoded.exp < currentTime) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    // console.error('Invalid token');
  }
};
