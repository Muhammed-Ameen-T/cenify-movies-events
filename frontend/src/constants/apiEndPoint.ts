export const API_BASE_URL = import.meta.env.VITE_API_URL;

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
  login: `/auth/admin/login`,
  forgotPassSendOtp: '/auth/fg-send-otp',
  forgotPassVerifyOtp: '/auth/fg-verify-otp',
  forgotPassUpdate: '/auth/fg-update-pass',

  fetchMovies: `/admin/fetch-movies`,
  fetchMovieById: `/admin/get-movie`, // Fetch a specific movie by ID
  editMovie: `/admin/edit-movie`,
  createMovie: `/admin/create-movie`,
  updateMovieStatus: `/admin/movie-status`,
  deleteMovie: `/admin/delete-movie`, // Delete a movie
  updateMovie: `/admin/edit-movie`, // Upload movie poster

  fetchUsers: `/admin/fetch-users`, // Fetch all users
  fetchUserById: `/admin/fetch-user`, // Fetch a specific user
  updateUserStatus: `/admin/update-user-status`, // Update user account status
  deleteUser: `/admin/delete-user`, // Delete a user account
};


export const VENDOR_ENDPOINTS = {
  register: `/vendor/register`,
  verifyOtp: `/vendor/verify-otp`,
  resendOtp: `/vendor/send-otp`,
  login: `/vendor/login`,
  updateDetails: `/vendor/update-vendor`,
  updateStatus: `/vendor/update-theater-status/`,
  fetchTheaters: `/vendor/fetch-theaters`,
  createTheater:`/vendor/create-theater`,
  fetchTheater:`/vendor/fetch-theater`,
  updateTheater:`/vendor/update-theater`,
  imageUpload: `https://api.cloudinary.com/v1_1/djqsehax7/image/upload`,  
};