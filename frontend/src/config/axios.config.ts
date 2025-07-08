import axios from "axios";
import { store } from ".././store/store";
import { updateToken, clearAuth } from ".././store/slices/authSlice";
import { AUTH_MESSAGES } from "../constants/auth.messages";
import {API_BASE_URL} from "../constants/apiEndPoint"
// Create Axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}`,
  withCredentials: true,
  timeout: 10000,
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const accessToken = store.getState().auth.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
); 

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    const newAccessToken = response.headers["x-access-token"];
    if (newAccessToken) {
      store.dispatch(updateToken(newAccessToken));
      localStorage.setItem("accessToken", newAccessToken); // Optional: persist it
    }
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error("Network error - server may be down");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (
      status === 403 &&
      data?.message === "Your account is blocked. Please contact support."
    ) {
      console.warn("User account is blocked.");
      store.dispatch(clearAuth());
      localStorage.setItem("blocked", "true");
      return Promise.reject(error);
    }

    if (status === 401) {
      console.warn(AUTH_MESSAGES.SESSION_EXPIRED);
      store.dispatch(clearAuth());
      localStorage.setItem("sessionExpired", "true");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;