import { Dispatch } from 'redux';
import { setAuth, clearAuth } from './slices/authSlice';
import { refreshToken } from '../services/User/authApi';

export const initializeAuth = async (dispatch: Dispatch) => {
  const accessToken = localStorage.getItem('accessToken');
  const storedUser = localStorage.getItem('user');

  if (accessToken && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      dispatch(setAuth({ user: parsedUser, accessToken }));
    } catch {
      dispatch(clearAuth());
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
    return;
  }


  const isLikelyLoggedOut = !document.cookie.includes('refreshToken');

  if (isLikelyLoggedOut) {
    dispatch(clearAuth());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    return;
  }

  const refreshed = await refreshToken();

  if (refreshed && refreshed.accessToken) {
    const refreshedUser = storedUser ? JSON.parse(storedUser) : null;
    dispatch(setAuth({ user: refreshedUser, accessToken: refreshed.accessToken }));
    localStorage.setItem('accessToken', refreshed.accessToken);
  } else {
    dispatch(clearAuth());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }
};