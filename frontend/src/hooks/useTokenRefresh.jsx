import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { getData, postData } from '../utils/api';
import { Config } from '../Config';
import { getToken } from '../utils/helpers';
import { useUserActivity } from './useUserActivity';

const customHeaders = {
  Authorization: 'Bearer ' + getToken(),
  'Content-Type': 'application/json',
};

const refreshToken = async () => {
  try {
    // Make an API request to refresh the token
    const response = await getData(
      `${Config.API_URL}/refreshToken`,
      customHeaders
    );
  } catch (error) {
    console.error('Failed to refresh token:', error);
  }
  return null;
};
export const useTokenRefresh = (token) => {
  const [currentToken, setCurrentToken] = useState(token);
  const isActive = useUserActivity(); // Check if user is active
  useEffect(() => {
    if (!token || !isActive) return;

    const decodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = decodedToken.exp;
    const timeToRefresh = (expirationTime - currentTime - 60) * 1000; // Refresh 1 minute before expiration

    const timer = setTimeout(async () => {
      const newToken = await refreshToken();
      if (newToken) {
        localStorage.setItem('token', newToken);
        setCurrentToken(newToken);
      }
    }, timeToRefresh);

    return () => clearTimeout(timer);
  }, [token, isActive]);

  return currentToken;
};
