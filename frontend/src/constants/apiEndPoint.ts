export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const USER_AUTH_ENDPOINTS = {
  facebookLogin: `/auth/facebook/callback`,
  googleLogin: `/auth/google/callback`,
  refreshToken: `/auth/refresh-token`,
  getUser: `/me`,
  sendOtp: `/auth/send-otp`,
  verifyOtp: `/auth/verify-otp`,
  login: `/auth/login`,
};

export const ADMIN_ENDPOINTS = {
  login: `/auth/admin/login`
}

export const VENDOR_ENDPOINTS = {
  register: `/vendor/register`,
  verifyOtp: `/vendor/verify-otp`,
  resendOtp: `/vendor/send-otp`,
  login: `/vendor/login`,
  updateDetails: `/vendor/update-vendor`,
  updateStatus: `/vendor/update-theater-status`,
  fetchTheaters: `/vendor/fetch-theaters`,
};