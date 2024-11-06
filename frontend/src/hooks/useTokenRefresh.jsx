import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { getData, postData } from '../utils/api';
import { Config } from '../Config';
import { getRefreshToken, getToken } from '../utils/helpers';
import { useUserActivity } from './useUserActivity';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { logout } from '../redux/features/auth/authSlice';

const customHeaders = {
  Authorization: 'Bearer ' + getRefreshToken(),
  'Content-Type': 'application/json',
};

const refreshToken = async () => {
  try {
    // Make an API request to refresh the token
    const response = await postData(
      `${Config.API_URL}/auth/refresh`,
      {},
      customHeaders
    );
    console.log('New refresh token: ' + response.access_token);
    return response.access_token;
  } catch (error) {
    console.error('Failed to refresh token:', error);
  }
  return null;
};
export const useTokenRefresh = (token) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentToken, setCurrentToken] = useState(token);
  const isActive = useUserActivity(); // Check if user is active
  useEffect(() => {
    if (!token || !isActive) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      dispatch(logout());
      navigate('/login');
      // window.location.reload();
    }
    console.log('Activity State ', isActive);

    const decodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = decodedToken.exp;
    const timeToRefresh = (expirationTime - currentTime) * 1000 - 1500; // Refresh 900ms before expiration

    const timer = setTimeout(async () => {
      const newToken = await refreshToken();
      if (newToken) {
        console.log('New Token ' + newToken);
        localStorage.setItem('token', newToken);
        setCurrentToken(newToken);
      }
    }, timeToRefresh);

    return () => clearTimeout(timer);
  }, [token, isActive]);

  return currentToken;
};
