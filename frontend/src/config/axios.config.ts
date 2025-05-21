import axios from "axios";
import { store } from "../store/store";
import { updateToken, clearAuth } from "../store/slices/authSlice";
import { startLoading, stopLoading } from "../store/slices/loadingSlice";
import { AUTH_MESSAGES, ERROR_MESSAGES } from "../constants/auth.messages";
import { SUCCESS_MESSAGES } from "../constants/success.messages";
import { API_BASE_URL } from "../constants/apiEndPoint";

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Function to refresh access token
const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh-token`,
      {},
      { withCredentials: true }
    );
    const newAccessToken = response.data.data.accessToken;
    store.dispatch(updateToken(newAccessToken));
    localStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    store.dispatch(clearAuth());
    localStorage.removeItem("accessToken");
    throw error;
  }
};

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  async (config) => {
    store.dispatch(startLoading());

    console.log(SUCCESS_MESSAGES.INTERCEPTOR_REQUEST_SUCCESS);

    let accessToken = store.getState().auth.accessToken;

    // If no access token, try to refresh
    if (!accessToken) {
      try {
        accessToken = await refreshAccessToken();
      } catch (error) {
        store.dispatch(stopLoading());
        return Promise.reject(error);
      }
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    store.dispatch(stopLoading());
    console.error(ERROR_MESSAGES.INTERCEPTOR_REQUEST_ERROR, error);
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    store.dispatch(stopLoading());
    console.log(SUCCESS_MESSAGES.INTERCEPTOR_RESPONSE_SUCCESS, response);

    const newAccessToken = response.headers["x-access-token"];
    if (newAccessToken) {
      store.dispatch(updateToken(newAccessToken));
      localStorage.setItem("accessToken", newAccessToken);
    }
    return response;
  },
  async (error) => {
    store.dispatch(stopLoading());
    console.log(ERROR_MESSAGES.INTERCEPTOR_RESPONSE_ERROR, error);

    if (!error.response) {
      console.error("Network error - server may be down");
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const originalRequest = error.config;

    if (
      status === 403 &&
      data?.message === AUTH_MESSAGES.BLOCKED_ACCOUNT
    ) {
      console.warn("User account is blocked.");
      store.dispatch(clearAuth());
      localStorage.setItem("blocked", "true");
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark request to avoid infinite retry loops
      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); // Retry original request with new token
      } catch (refreshError) {
        store.dispatch(clearAuth());
        localStorage.removeItem("accessToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;