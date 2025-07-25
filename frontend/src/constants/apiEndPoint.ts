export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const USER_AUTH_ENDPOINTS = {
  googleLogin: `/auth/google/callback`,
  refreshToken: `/auth/refresh-token`,
  getUser: `/profile/me`,
  updateProfile: `/profile/update`,
  getProfileContent: `/profile/content`,
  sendOtp: `/auth/send-otp`,
  verifyOtp: `/auth/verify-otp`,
  login: `/auth/login`,
  userMovies: `/movie/fetch`,
  toggleBookmark:'/movie/bookmark',
  movieDetails:'/movie/find',
  getUserWallet:'/profile/wallet',
  changePassword:'/profile/changePassword',
  likeMovie: '/movie/like',
  isLikedMovie: '/movie/isLiked'
};

export const USER_ENDPOINTS = {
  getMoviePass:'/movie-pass/movie-pass',
  createCheckoutSession:'/movie-pass/checkout-session',
  getMoviePassWebhook:'/movie-pass/webhook',
  getSeats: '/seat-selection',
  selectSeats: '/seat-selection',
  findShowById: '/show/find/',
  createBooking: '/booking/create',
  getPaymentOptions: '/booking/check-payment-options',
  findBookingById: '/booking/find/',
  findUserBookings: '/booking/user-bookings',
  cancelUserBooking: '/booking/cancel/',
  fetchAllBooking: '/booking/fetch',
  fetchVendorBookings: '/booking/fetch-vendor',
  rateMovie:'/movie/rate',
  getUserWalletTransactions: '/profile/transactions',
  verifyOtpPhone: '/profile/verify-otp-phone',
  sendOtpPhone: '/profile/send-otp-phone',
  redeemPoints: '/profile/redeem-points',
  walletWithdraw: '/profile/wallet-withdraw',
  getMoviePassHistory: 'movie-pass/history'
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
  rateMovie: `/admin/rate-movie`, // Rate a movie

  fetchUsers: `/admin/fetch-users`, // Fetch all users
  fetchUserById: `/admin/fetch-user`, // Fetch a specific user
  updateUserStatus: `/admin/update-user-status`, // Update user account status
  deleteUser: `/admin/delete-user`, // Delete a user account
  getDashboard: `/dashboard/admin`, // Fetch admin dashboard data

  fetchTheaters: '/theater/fetch-admin'
};


export const VENDOR_ENDPOINTS = {
  register: `/vendor/register`,
  verifyOtp: `/vendor/verify-otp`,
  resendOtp: `/vendor/send-otp`,
  login: `/vendor/login`,
  updateDetails: `/vendor/update-vendor`,
  updateStatus: `/theater/update-theater-status/`,
  fetchTheaters: `/theater/fetchAll`,
  createTheater:`/vendor/create-theater`,
  fetchTheater:`/theater/fetch-vendor`,
  updateTheater:`/theater/update-theater`,
  findTheater:`/theater/find/`,
  createLayout:`/vendor/create-seat-layout`,
  fetchSeatLayouts: `/vendor/fetch-seats`,
  findSeatLayouts: `/vendor/find-seats`,
  updateLayout: `/vendor/update-layout`,
  imageUpload: `https://api.cloudinary.com/v1_1/djqsehax7/image/upload`,  
  fetchScreensByVendor: `/screen/fetch`,
  createScreen: `/screen/create`,
  updateScreen: `/screen/update`,
  fetchShowsByVendor: `/show/fetch-vendor`,
  createShow: `/show/create`,
  updateShow: `/show/update`,
  deleteShow: `/show/delete`,
  updateShowStatus: `/show/status`,
  fetchAllShows: `/show/fetch`,
  findShowById: `/show/find`,
  getShowSelection: '/show/selection',
  reccuringShow: '/show/recurring',
  getDashboard: `/dashboard/vendor`,
};

export const NOTIFICATION_ENDPOINTS = {
  global: '/notifications/global',
  user: '/notifications/user',
  admin: '/notifications/admin',
  vendor: '/notifications/vendor',
  readOne: '/notifications/read',
  readAll: '/notifications/read-all',
  readAllAdmin: '/notifications/read-all-admin',
  currentVendor: '/notifications/vendors/me',
};