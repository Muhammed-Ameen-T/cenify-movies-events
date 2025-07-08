// src/initializeAuth.ts
import { Dispatch } from 'redux';
import { setAuth, clearAuth } from './slices/authSlice';
import { refreshToken } from '../services/User/authApi';

export const initializeAuth = async (dispatch: Dispatch) => {
  console.log('initializeAuth: Starting authentication check');
  
  const accessToken = localStorage.getItem('accessToken');
  const storedUser = localStorage.getItem('user');

  if (accessToken && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      console.log('initializeAuth: Found stored token and user:', { accessToken, parsedUser });

      dispatch(setAuth({ user: parsedUser, accessToken }));
    } catch (error) {
      console.error('initializeAuth: Failed to parse user from localStorage:', error);
      
      dispatch(clearAuth());
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  } else {
    console.log('initializeAuth: No valid token/user in localStorage, attempting refresh');
    
    try {
      const { accessToken: newAccessToken } = await refreshToken();

      if (!newAccessToken) {
        throw new Error('Failed to retrieve new access token.');
      }

      console.log('initializeAuth: Token refreshed successfully:', newAccessToken);

      // Retrieve user details before setting auth
      const refreshedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

      dispatch(setAuth({ user: refreshedUser, accessToken: newAccessToken }));
      
      localStorage.setItem('accessToken', newAccessToken);
    } catch (error) {
      console.error('initializeAuth: Failed to refresh token:', error instanceof Error ? error.message : 'Unknown error');

      dispatch(clearAuth());
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }
};
  