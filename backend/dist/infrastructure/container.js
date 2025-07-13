"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
// src/infrastructure/container.ts
const tsyringe_1 = require("tsyringe");
Object.defineProperty(exports, "container", { enumerable: true, get: function () { return tsyringe_1.container; } });
const sendOtpUser_useCase_1 = require("../application/useCases/userAuth/sendOtpUser.useCase");
const verifyOtpUser_useCase_1 = require("../application/useCases/userAuth/verifyOtpUser.useCase");
const googleAuth_useCase_1 = require("../application/useCases/userAuth/googleAuth.useCase");
const loginUser_useCase_1 = require("../application/useCases/userAuth/loginUser.useCase");
const auth_repository_1 = require("./repositories/auth.repository");
const user_repository_1 = require("./repositories/user.repository");
const adminLogin_useCase_1 = require("../application/useCases/adminAuth/adminLogin.useCase");
const adminAuth_controller_1 = require("../presentation/controllers/adminAuth.controller");
const userAuth_controller_1 = require("../presentation/controllers/userAuth.controller");
const vendorAuth_controller_1 = require("../presentation/controllers/vendorAuth.controller");
const facebook_service_1 = require("./services/facebook.service");
const redis_service_1 = require("./services/redis.service");
const jwt_service_1 = require("./services/jwt.service");
const sendOtpVendor_useCase_1 = require("../application/useCases/vendorAuth/sendOtpVendor.useCase");
const verifyOtpVendor_useCase_1 = require("../application/useCases/vendorAuth/verifyOtpVendor.useCase");
const loginVendor_useCase_1 = require("../application/useCases/vendorAuth/loginVendor.useCase");
const createNewTheater_useCase_1 = require("../application/useCases/theaterMng/createNewTheater.useCase");
const theater_repository_1 = require("./repositories/theater.repository");
const theaterMng_controller_1 = require("../presentation/controllers/theaterMng.controller");
const fetchTheaters_useCase_1 = require("../application/useCases/theaterMng/fetchTheaters.useCase");
const updateTheaterStatus_useCase_1 = require("../application/useCases/theaterMng/updateTheaterStatus.useCase");
const forgotPassSendOtp_useCase_1 = require("../application/useCases/adminAuth/forgotPassSendOtp.useCase");
const forgotPassUpdate_useCase_1 = require("../application/useCases/adminAuth/forgotPassUpdate.useCase");
const forgotPassVerifyOtp_useCase_1 = require("../application/useCases/adminAuth/forgotPassVerifyOtp.useCase");
const userMng_controller_1 = require("../presentation/controllers/userMng.controller");
const updateUserBlockStatus_useCase_1 = require("../application/useCases/userMng/updateUserBlockStatus.useCase");
const fetchUser_useCase_1 = require("../application/useCases/userMng/fetchUser.useCase");
const movie_repository_1 = require("./repositories/movie.repository");
const createMovie_useCase_1 = require("../application/useCases/movieMng/createMovie.useCase");
const fetchMovies_useCase_1 = require("../application/useCases/movieMng/fetchMovies.useCase");
const updateMovieStatus_useCase_1 = require("../application/useCases/movieMng/updateMovieStatus.useCase");
const movieMng_controller_1 = require("../presentation/controllers/movieMng.controller");
const updateMovie_useCase_1 = require("../application/useCases/movieMng/updateMovie.useCase");
const findMovieById_useCase_1 = require("../application/useCases/movieMng/findMovieById.useCase");
const fetchTheaterOfVendor_useCase_1 = require("../application/useCases/theaterMng/fetchTheaterOfVendor.useCase");
const updateTheater_useCase_1 = require("../application/useCases/theaterMng/updateTheater.useCase");
const seatLayout_repository_1 = require("./repositories/seatLayout.repository");
const createSeatLayout_useCase_1 = require("../application/useCases/seatLayoutMng/createSeatLayout.useCase");
const seatLayoutsMng_controller_1 = require("../presentation/controllers/seatLayoutsMng.controller");
const getUserDetail_useCase_1 = require("../application/useCases/userProfile/getUserDetail.useCase");
const updateUserProfile_useCase_1 = require("../application/useCases/userProfile/updateUserProfile.useCase");
const userProfile_controller_1 = require("../presentation/controllers/userProfile.controller");
const fetchScreensOfVendor_useCase_1 = require("../application/useCases/screenMng/fetchScreensOfVendor.useCase");
const updateScreen_useCase_1 = require("../application/useCases/screenMng/updateScreen.useCase");
const screen_repository_1 = require("./repositories/screen.repository");
const createScreen_useCase_1 = require("../application/useCases/screenMng/createScreen.useCase");
const screenMng_controller_1 = require("../presentation/controllers/screenMng.controller");
const fetchLayoutsVendor_useCase_1 = require("../application/useCases/seatLayoutMng/fetchLayoutsVendor.useCase");
const show_repository_1 = require("./repositories/show.repository");
const createShow_useCase_1 = require("../application/useCases/showMng/createShow.useCase");
const updateShow_useCase_1 = require("../application/useCases/showMng/updateShow.useCase");
const updateShowStatus_useCase_1 = require("../application/useCases/showMng/updateShowStatus.useCase");
const deleteShow_useCase_1 = require("../application/useCases/showMng/deleteShow.useCase");
const fetchAllShow_useCase_1 = require("../application/useCases/showMng/fetchAllShow.useCase");
const findVendorShows_useCase_1 = require("../application/useCases/showMng/findVendorShows.useCase");
const showMng_controller_1 = require("../presentation/controllers/showMng.controller");
const findShow_useCase_1 = require("../application/useCases/showMng/findShow.useCase");
const showAgenda_service_1 = require("./services/showAgenda.service");
const findLayoutById_useCase_1 = require("../application/useCases/seatLayoutMng/findLayoutById.useCase");
const updateSeatLayout_useCase_1 = require("../application/useCases/seatLayoutMng/updateSeatLayout.useCase");
const fetchMoviesUser_useCase_1 = require("../application/useCases/movieMng/fetchMoviesUser.useCase");
const fetchShowSelection_useCase_1 = require("../application/useCases/showMng/fetchShowSelection.useCase");
const createRecurringShow_usecase_1 = require("../application/useCases/showMng/createRecurringShow.usecase");
const moviePass_repository_1 = require("./repositories/moviePass.repository");
const createMoviePass_useCase_1 = require("../application/useCases/moviePassMng/createMoviePass.useCase");
const fetchMoviePass_useCase_1 = require("../application/useCases/moviePassMng/fetchMoviePass.useCase");
const moviePass_controller_1 = require("../presentation/controllers/moviePass.controller");
const moviePass_service_1 = require("./services/moviePass.service");
const stripeWebhook_controller_1 = require("../presentation/controllers/stripeWebhook.controller");
const bookingStripeWebhook_controller_1 = require("../presentation/controllers/bookingStripeWebhook.controller");
const notification_repository_1 = require("./repositories/notification.repository");
const seatSelection_controller_1 = require("../presentation/controllers/seatSelection.controller");
const fetchSeatSelection_useCase_1 = require("../application/useCases/seatLayoutMng/fetchSeatSelection.useCase");
const selectSeats_useCase_1 = require("../application/useCases/seatLayoutMng/selectSeats.useCase");
const seat_repository_1 = require("./repositories/seat.repository");
const wallet_repository_1 = require("./repositories/wallet.repository");
const booking_repository_1 = require("./repositories/booking.repository");
const createBooking_useCase_1 = require("../application/useCases/bookingMng/createBooking.useCase");
const fetchBooking_useCase_1 = require("../application/useCases/bookingMng/fetchBooking.useCase");
const findBookingsOfUser_useCase_1 = require("../application/useCases/bookingMng/findBookingsOfUser.useCase");
const findBookingById_useCase_1 = require("../application/useCases/bookingMng/findBookingById.useCase");
const bookingMng_controller_1 = require("../presentation/controllers/bookingMng.controller");
const checkoutPayment_service_1 = require("./services/checkoutPayment.service");
const findUserWallet_useCase_1 = require("../application/useCases/userProfile/findUserWallet.useCase");
const notification_service_1 = require("./services/notification.service");
const notificationMng_controller_1 = require("../presentation/controllers/notificationMng.controller");
const fetchVendorBookings_1 = require("../application/useCases/bookingMng/fetchVendorBookings");
const fetchVendorDashboard_1 = require("../application/useCases/dashboardData/fetchVendorDashboard");
const vendorDashboard_repository_1 = require("./repositories/vendorDashboard.repository");
const dashboard_controller_1 = require("../presentation/controllers/dashboard.controller");
const adminDashboard_repository_1 = require("./repositories/adminDashboard.repository");
const fetchAdminDashboard_useCase_1 = require("../application/useCases/dashboardData/fetchAdminDashboard.useCase");
const cancelBooking_useCase_1 = require("../application/useCases/bookingMng/cancelBooking.useCase");
const movieRating_useCase_1 = require("../application/useCases/movieMng/movieRating.useCase");
const changePassword_useCase_1 = require("../application/useCases/userProfile/changePassword.useCase");
const cloudinary_service_1 = require("./services/cloudinary.service");
const findUserTransaction_useCase_1 = require("../application/useCases/userProfile/findUserTransaction.useCase");
const fetchMoviePassHistory_useCase_1 = require("../application/useCases/moviePassMng/fetchMoviePassHistory.useCase");
const fetchAdminTheaters_useCase_1 = require("../application/useCases/theaterMng/fetchAdminTheaters.useCase");
const redeemPointsToWallet_useCase_1 = require("../application/useCases/userProfile/redeemPointsToWallet.useCase");
const sms_service_1 = require("./services/sms.service");
const sendOtpPhone_useCase_1 = require("../application/useCases/userProfile/sendOtpPhone.useCase");
const verifyOtpPhone_useCase_1 = require("../application/useCases/userProfile/verifyOtpPhone.useCase");
//Controller Registration
tsyringe_1.container.register('UserAuthController', { useClass: userAuth_controller_1.UserAuthController });
tsyringe_1.container.register('VendorAuthController', {
    useClass: vendorAuth_controller_1.VendorAuthController,
});
tsyringe_1.container.register('AdminAuthController', { useClass: adminAuth_controller_1.AdminAuthController });
//UseCase Registration
tsyringe_1.container.register('SendOtpUserUseCase', { useClass: sendOtpUser_useCase_1.SendOtpUseCase });
tsyringe_1.container.register('VerifyOtpUserUseCase', { useClass: verifyOtpUser_useCase_1.VerifyOtpUseCase });
tsyringe_1.container.register('GoogleAuthUseCase', { useClass: googleAuth_useCase_1.GoogleAuthUseCase });
tsyringe_1.container.register('LoginUserUseCase', { useClass: loginUser_useCase_1.LoginUserUseCase });
// container.register<IVerifyOtpUseCase>('VerifyOtpUserUseCase', { useClass: VerifyOtpUseCase });
tsyringe_1.container.register('LoginAdminUseCase', { useClass: adminLogin_useCase_1.LoginAdminUseCase });
tsyringe_1.container.register('ForgotPassSendOtp', {
    useClass: forgotPassSendOtp_useCase_1.ForgotPasswordSendOtpUseCase,
});
tsyringe_1.container.register('ForgotPassUpdate', {
    useClass: forgotPassUpdate_useCase_1.ForgotPasswordUpdateUseCase,
});
tsyringe_1.container.register('ForgotPassVerifyOtp', {
    useClass: forgotPassVerifyOtp_useCase_1.ForgotPasswordVerifyOtpUseCase,
});
tsyringe_1.container.register('SendOtpVendorUseCase', {
    useClass: sendOtpVendor_useCase_1.sendOtpVendorUseCase,
});
tsyringe_1.container.register('VerifyOtpVendorUseCase', {
    useClass: verifyOtpVendor_useCase_1.VerifyOtpVendorUseCase,
});
tsyringe_1.container.register('LoginVendorUseCase', { useClass: loginVendor_useCase_1.LoginVendorUseCase });
// Repository Registration
tsyringe_1.container.register('AuthRepository', { useClass: auth_repository_1.AuthRepository });
tsyringe_1.container.register('TheaterRepository', { useClass: theater_repository_1.TheaterRepository });
tsyringe_1.container.register('IUserRepository', { useClass: user_repository_1.UserRepositoryImpl });
// Services Registration
tsyringe_1.container.register('RedisService', { useClass: redis_service_1.RedisService });
tsyringe_1.container.register('JwtService', { useClass: jwt_service_1.JwtService });
tsyringe_1.container.register('FacebookService', { useClass: facebook_service_1.FacebookService });
tsyringe_1.container.register('JwtService', { useClass: jwt_service_1.JwtService });
tsyringe_1.container.register('RedisService', { useClass: redis_service_1.RedisService });
// Movie Management UseCases and Controller Registration
tsyringe_1.container.register('MovieRepository', { useClass: movie_repository_1.MovieRepository });
tsyringe_1.container.register('CreateMovieUseCase', { useClass: createMovie_useCase_1.CreateMovieUseCase });
tsyringe_1.container.register('FetchMoviesUseCase', { useClass: fetchMovies_useCase_1.FetchMoviesUseCase });
tsyringe_1.container.register('UpdateMovieStatusUseCase', {
    useClass: updateMovieStatus_useCase_1.UpdateMovieStatusUseCase,
});
tsyringe_1.container.register('UpdateMovieUseCase', { useClass: updateMovie_useCase_1.UpdateMovieUseCase });
tsyringe_1.container.register('MovieMngController', { useClass: movieMng_controller_1.MovieMngController });
tsyringe_1.container.register('FindMovieByIdUseCase', {
    useClass: findMovieById_useCase_1.FindMovieByIdUseCase,
});
tsyringe_1.container.register('FetchMoviesUserUseCase', {
    useClass: fetchMoviesUser_useCase_1.FetchMoviesUserUseCase,
});
tsyringe_1.container.register('RateMovieUseCase', {
    useClass: movieRating_useCase_1.RateMovieUseCase,
});
// User Management UseCases and Controller Registration
tsyringe_1.container.register('FetchUsersUseCase', { useClass: fetchUser_useCase_1.FetchUsersUseCase });
tsyringe_1.container.register('UpdateUserBlockStatusUseCase', {
    useClass: updateUserBlockStatus_useCase_1.UpdateUserBlockStatusUseCase,
});
tsyringe_1.container.register('UserManagementController', {
    useClass: userMng_controller_1.UserManagementController,
});
//Theater Management UseCases and Controller Registration
tsyringe_1.container.register('TheaterMngController', {
    useClass: theaterMng_controller_1.TheaterManagementController,
});
tsyringe_1.container.register('CreateTheaterUseCase', {
    useClass: createNewTheater_useCase_1.CreateNewTheaterUseCase,
});
tsyringe_1.container.register('FetchTheatersUseCase', {
    useClass: fetchTheaters_useCase_1.FetchTheatersUseCase,
});
tsyringe_1.container.register('UpdateTheaterStatus', {
    useClass: updateTheaterStatus_useCase_1.UpdateTheaterStatusUseCase,
});
tsyringe_1.container.register('UpdateTheater', { useClass: updateTheater_useCase_1.UpdateTheaterUseCase });
tsyringe_1.container.register('FetchTheaterOfVendorUseCase', {
    useClass: fetchTheaterOfVendor_useCase_1.FetchTheaterOfVendorUseCase,
});
tsyringe_1.container.register('FetchAdminTheatersUseCase', {
    useClass: fetchAdminTheaters_useCase_1.FetchAdminTheatersUseCase,
});
// Seat Layout UseCases and Controller Registration
tsyringe_1.container.register('CreateSeatLayoutUseCase', {
    useClass: createSeatLayout_useCase_1.CreateSeatLayoutUseCase,
});
tsyringe_1.container.register('SeatLayoutRepository', {
    useClass: seatLayout_repository_1.SeatLayoutRepository,
});
tsyringe_1.container.register('SeatLayoutController', {
    useClass: seatLayoutsMng_controller_1.SeatLayoutController,
});
tsyringe_1.container.register('FindSeatLayoutsByVendorUseCase', {
    useClass: fetchLayoutsVendor_useCase_1.FindSeatLayoutsByVendorUseCase,
});
tsyringe_1.container.register('UpdateSeatLayoutUseCase', {
    useClass: updateSeatLayout_useCase_1.UpdateSeatLayoutUseCase,
});
tsyringe_1.container.register('FindSeatLayoutByIdUseCase', {
    useClass: findLayoutById_useCase_1.FindSeatLayoutByIdUseCase,
});
// User Profile UseCase,Controller Registration
tsyringe_1.container.register('UpdateUserProfileUseCase', {
    useClass: updateUserProfile_useCase_1.updateUserProfileUseCase,
});
tsyringe_1.container.register('ChangePasswordUseCase', {
    useClass: changePassword_useCase_1.ChangePasswordUseCase,
});
tsyringe_1.container.register('GetUserDetailsUseCase', {
    useClass: getUserDetail_useCase_1.getUserDetailsUseCase,
});
tsyringe_1.container.register('RedeemLoyalityToWalletUseCase', {
    useClass: redeemPointsToWallet_useCase_1.RedeemLoyalityToWalletUseCase,
});
tsyringe_1.container.register('UserProfileController', {
    useClass: userProfile_controller_1.UserProfileController,
});
tsyringe_1.container.register('SmsService', { useClass: sms_service_1.SmsService });
tsyringe_1.container.register('SendOtpPhoneUseCase', { useClass: sendOtpPhone_useCase_1.SendOtpPhoneUseCase });
tsyringe_1.container.register('VerifyOtpPhoneUseCase', { useClass: verifyOtpPhone_useCase_1.VerifyOtpPhoneUseCase });
// Screen Management UseCase, Controller, Repository Registration
tsyringe_1.container.register('ScreenRepository', { useClass: screen_repository_1.ScreenRepository });
tsyringe_1.container.register('CreateScreenUseCase', { useClass: createScreen_useCase_1.CreateScreenUseCase });
tsyringe_1.container.register('FetchScreensOfVendorUseCase', {
    useClass: fetchScreensOfVendor_useCase_1.FetchScreensOfVendorUseCase,
});
tsyringe_1.container.register('UpdateScreenUseCase', { useClass: updateScreen_useCase_1.UpdateScreenUseCase });
tsyringe_1.container.register('ScreenManagementController', {
    useClass: screenMng_controller_1.ScreenManagementController,
});
// Show Management UseCase, Controller, Repository Registration
tsyringe_1.container.register('ShowRepository', { useClass: show_repository_1.ShowRepository });
tsyringe_1.container.register('CreateShowUseCase', { useClass: createShow_useCase_1.CreateShowUseCase });
tsyringe_1.container.register('CreateRecurringShowUseCase', {
    useClass: createRecurringShow_usecase_1.CreateRecurringShowUseCase,
});
tsyringe_1.container.register('UpdateShowUseCase', { useClass: updateShow_useCase_1.UpdateShowUseCase });
tsyringe_1.container.register('UpdateShowStatusUseCase', {
    useClass: updateShowStatus_useCase_1.UpdateShowStatusUseCase,
});
tsyringe_1.container.register('DeleteShowUseCase', { useClass: deleteShow_useCase_1.DeleteShowUseCase });
tsyringe_1.container.register('FindShowByIdUseCase', { useClass: findShow_useCase_1.FindShowByIdUseCase });
tsyringe_1.container.register('FindAllShowsUseCase', { useClass: fetchAllShow_useCase_1.FindAllShowsUseCase });
tsyringe_1.container.register('FindShowsByVendorUseCase', {
    useClass: findVendorShows_useCase_1.FindShowsByVendorUseCase,
});
tsyringe_1.container.register('ShowManagementController', {
    useClass: showMng_controller_1.ShowManagementController,
});
tsyringe_1.container.register('FetchShowSelectionUseCase', {
    useClass: fetchShowSelection_useCase_1.FetchShowSelectionUseCase,
});
tsyringe_1.container.register('ShowJobService', { useClass: showAgenda_service_1.ShowJobService });
// MoviePass Management UseCase,Payment,Controller,Repository Registration
tsyringe_1.container.register('MoviePassRepository', { useClass: moviePass_repository_1.MoviePassRepository });
tsyringe_1.container.register('NotificationRepository', {
    useClass: notification_repository_1.NotificationRepository,
});
tsyringe_1.container.register('CreateMoviePassUseCase', {
    useClass: createMoviePass_useCase_1.CreateMoviePassUseCase,
});
tsyringe_1.container.register('FetchMoviePassUseCase', {
    useClass: fetchMoviePass_useCase_1.FetchMoviePassUseCase,
});
tsyringe_1.container.register('FindMoviePassHistoryUseCase', {
    useClass: fetchMoviePassHistory_useCase_1.FindMoviePassHistoryUseCase,
});
tsyringe_1.container.register('MoviePassController', { useClass: moviePass_controller_1.MoviePassController });
tsyringe_1.container.register('StripeWebhookController', {
    useClass: stripeWebhook_controller_1.StripeWebhookController,
});
tsyringe_1.container.register('MoviePassJobService', { useClass: moviePass_service_1.MoviePassJobService });
// Seat Selevtion Service, Repository, Controller and useCase Registration
tsyringe_1.container.register('SeatSelectionController', {
    useClass: seatSelection_controller_1.SeatSelectionController,
});
tsyringe_1.container.register('FetchSeatSelectionUseCase', {
    useClass: fetchSeatSelection_useCase_1.FetchSeatSelectionUseCase,
});
tsyringe_1.container.register('SelectSeatsUseCase', { useClass: selectSeats_useCase_1.SelectSeatsUseCase });
tsyringe_1.container.register('SeatRepository', { useClass: seat_repository_1.SeatRepository });
// container.registerSingleton('SocketService', SocketService);
// container.registerSingleton<SocketService>(SocketService);
// container.register('SocketService', { useClass: SocketService });
tsyringe_1.container.registerSingleton('ShowRepository', show_repository_1.ShowRepository);
tsyringe_1.container.registerSingleton('SeatLayoutRepository', seatLayout_repository_1.SeatLayoutRepository);
tsyringe_1.container.registerSingleton('ScreenRepository', screen_repository_1.ScreenRepository);
tsyringe_1.container.registerSingleton('SeatRepository', seat_repository_1.SeatRepository);
tsyringe_1.container.registerSingleton('ShowJobService', showAgenda_service_1.ShowJobService);
// Wallet Repository Registration
tsyringe_1.container.register('WalletRepository', { useClass: wallet_repository_1.WalletRepository });
tsyringe_1.container.register('FindUserWalletUseCase', {
    useClass: findUserWallet_useCase_1.FindUserWalletUseCase,
});
tsyringe_1.container.register('WalletTransactionUseCase', {
    useClass: findUserTransaction_useCase_1.FindUserWalletTransactionsUseCase,
});
// Booking Repository,Controller,UseCase Registration
tsyringe_1.container.register('BookingRepository', { useClass: booking_repository_1.BookingRepository });
tsyringe_1.container.register('CreateBookingUseCase', {
    useClass: createBooking_useCase_1.CreateBookingUseCase,
});
tsyringe_1.container.register('FetchAllBookingsUseCase', {
    useClass: fetchBooking_useCase_1.FetchAllBookingsUseCase,
});
tsyringe_1.container.register('FindBookingByIdUseCase', {
    useClass: findBookingById_useCase_1.FindBookingByIdUseCase,
});
tsyringe_1.container.register('FindBookingsOfUserUseCase', {
    useClass: findBookingsOfUser_useCase_1.FindBookingsOfUserUseCase,
});
tsyringe_1.container.register('CancelBookingUseCase', {
    useClass: cancelBooking_useCase_1.CancelBookingUseCase,
});
tsyringe_1.container.register('FindBookingsOfVendorUseCase', {
    useClass: fetchVendorBookings_1.FindBookingsOfVendorUseCase,
});
tsyringe_1.container.register('BookingMngController', {
    useClass: bookingMng_controller_1.BookingMngController,
});
tsyringe_1.container.register('PaymentService', { useClass: checkoutPayment_service_1.PaymentService });
tsyringe_1.container.register('CloudinaryService', { useClass: cloudinary_service_1.CloudinaryService });
tsyringe_1.container.register('BookingStripeWebhookController', { useClass: bookingStripeWebhook_controller_1.BookingStripeWebhookController });
// Notification Service Registration
tsyringe_1.container.register('NotificationService', { useClass: notification_service_1.NotificationService });
tsyringe_1.container.register('NotificationMngController', {
    useClass: notificationMng_controller_1.NotificationMngController,
});
// DashBoard Data UseCase,Controller,Repository Registration
tsyringe_1.container.register('DashboardRepository', { useClass: vendorDashboard_repository_1.DashboardRepository });
tsyringe_1.container.register('FetchDashboardUseCase', {
    useClass: fetchVendorDashboard_1.FetchDashboardUseCase,
});
tsyringe_1.container.register('FetchAdminDashboardUseCase', {
    useClass: fetchAdminDashboard_useCase_1.FetchAdminDashboardUseCase,
});
tsyringe_1.container.register('DashboardController', { useClass: dashboard_controller_1.DashboardController });
tsyringe_1.container.register('AdminDashboardRepository', {
    useClass: adminDashboard_repository_1.AdminDashboardRepository,
});
