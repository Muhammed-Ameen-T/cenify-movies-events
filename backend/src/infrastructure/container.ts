// src/infrastructure/container.ts
import { container } from 'tsyringe';
import { UserModel } from './database/user.model';
import { SendOtpUseCase } from '../application/useCases/userAuth/sendOtpUser.useCase';
import { VerifyOtpUseCase } from '../application/useCases/userAuth/verifyOtpUser.useCase';
import { GoogleAuthUseCase } from '../application/useCases/userAuth/googleAuth.useCase';
import { LoginUserUseCase } from '../application/useCases/userAuth/loginUser.useCase';
import { IGoogleAuthUseCase } from '../domain/interfaces/useCases/User/googleAuthUser.interface';
import { ISendOtpUseCase } from '../domain/interfaces/useCases/User/sentOtpUser.interface';
import { IVerifyOtpUseCase } from '../domain/interfaces/useCases/User/verifyOtpUser.interface';
import { ILoginUserUseCase } from '../domain/interfaces/useCases/User/loginUser.interface';
import { AuthRepository } from './repositories/auth.repository';
import { IAuthRepository } from '../domain/interfaces/repositories/userAuth.types';
import { UserRepositoryImpl } from './repositories/user.repository';
import { LoginAdminUseCase } from '../application/useCases/adminAuth/adminLogin.useCase';
import { ILoginAdminUseCase } from '../domain/interfaces/useCases/Admin/adminLogin.interface';
import { AdminAuthController } from '../presentation/controllers/adminAuth.controller';
import { UserAuthController } from '../presentation/controllers/userAuth.controller';
import { VendorAuthController } from '../presentation/controllers/vendorAuth.controller';
import { IUserAuthController } from '../presentation/controllers/interface/userAuth.controller.interface';
import { IVendorAuthController } from '../presentation/controllers/interface/vendorAuth.controller.interface';
import { IAdminAuthController } from '../presentation/controllers/interface/adminAuth.controller.interface';
import { FacebookService } from './services/facebook.service';
import { RedisService } from './services/redis.service';
import { JwtService } from './services/jwt.service';
import { IUserRepository } from '../domain/interfaces/repositories/user.repository';
import { ISendOtpVendorUseCase } from '../domain/interfaces/useCases/Vendor/sendOtpVendor.interface';
import { sendOtpVendorUseCase } from '../application/useCases/vendorAuth/sendOtpVendor.useCase';
import { IVerifyOtpVendorUseCase } from '../domain/interfaces/useCases/Vendor/verifyOtpVendor.interface';
import { VerifyOtpVendorUseCase } from '../application/useCases/vendorAuth/verifyOtpVendor.useCase';
import { ILoginVendorUseCase } from '../domain/interfaces/useCases/Vendor/loginVendor.interface';
import { LoginVendorUseCase } from '../application/useCases/vendorAuth/loginVendor.useCase';
import { ICreateNewTheaterUseCase } from '../domain/interfaces/useCases/Vendor/createNewTheater.interface';
import { CreateNewTheaterUseCase } from '../application/useCases/theaterMng/createNewTheater.useCase';
import { ITheaterRepository } from '../domain/interfaces/repositories/theater.repository';
import { TheaterRepository } from './repositories/theater.repository';
import { ITheaterManagementController } from '../presentation/controllers/interface/theaterMng.controller.interface';
import { TheaterManagementController } from '../presentation/controllers/theaterMng.controller';
import { IFetchTheatersUseCase } from '../domain/interfaces/useCases/Vendor/fetchTheaters.interface';
import { FetchTheatersUseCase } from '../application/useCases/theaterMng/fetchTheaters.useCase';
import { IUpdateTheaterStatusUseCase } from '../domain/interfaces/useCases/Vendor/updateTheaterStatus.interface';
import { UpdateTheaterStatusUseCase } from '../application/useCases/theaterMng/updateTheaterStatus.useCase';
import { IForgotPasswordSendOtpUseCase } from '../domain/interfaces/useCases/Admin/forgotPasswordSendOtp.interface';
import { ForgotPasswordSendOtpUseCase } from '../application/useCases/adminAuth/forgotPassSendOtp.useCase';
import { IForgotPasswordUpdateUseCase } from '../domain/interfaces/useCases/Admin/forgotPasswordUpdate.interface';
import { ForgotPasswordUpdateUseCase } from '../application/useCases/adminAuth/forgotPassUpdate.useCase';
import { ForgotPasswordVerifyOtpUseCase } from '../application/useCases/adminAuth/forgotPassVerifyOtp.useCase';
import { IForgotPasswordVerifyOtpUseCase } from '../domain/interfaces/useCases/Admin/forgotPasswordVerifyOtp.interface';
import { UserManagementController } from '../presentation/controllers/userMng.controller';
import { UpdateUserBlockStatusUseCase } from '../application/useCases/userMng/updateUserBlockStatus.useCase';
import { FetchUsersUseCase } from '../application/useCases/userMng/fetchUser.useCase';
import { IFetchUsersUseCase } from '../domain/interfaces/useCases/Admin/fetchUsers.interface';
import { IUpdateUserBlockStatusUseCase } from '../domain/interfaces/useCases/Admin/updateUserBlockStatus.interface';
import { IUserManagementController } from '../presentation/controllers/interface/userMng.controller.interface';
import { MovieRepository } from './repositories/movie.repository';
import { CreateMovieUseCase } from '../application/useCases/movieMng/createMovie.useCase';
import { FetchMoviesUseCase } from '../application/useCases/movieMng/fetchMovies.useCase';
import { UpdateMovieStatusUseCase } from '../application/useCases/movieMng/updateMovieStatus.useCase';
import { MovieMngController } from '../presentation/controllers/movieMng.controller';
import { UpdateMovieUseCase } from '../application/useCases/movieMng/updateMovie.useCase';
import { IMovieRepository } from '../domain/interfaces/repositories/movie.repository';
import { ICreateMovieUseCase } from '../domain/interfaces/useCases/Admin/createMovie.interface';
import { IFetchMoviesUseCase } from '../domain/interfaces/useCases/Admin/fetchMovies.interface';
import { IUpdateMovieStatusUseCase } from '../domain/interfaces/useCases/Admin/updateMovieStatus.interface';
import { IMovieMngController } from '../presentation/controllers/interface/movieMng.controller.interface';
import { IUpdateMovieUseCase } from '../domain/interfaces/useCases/Admin/updateMovie.interface';
import { FindMovieByIdUseCase } from '../application/useCases/movieMng/findMovieById.useCase';
import { IFindMovieByIdUseCase } from '../domain/interfaces/useCases/Admin/findMovieById.interface';
import { IFetchTheaterOfVendorUseCase } from '../domain/interfaces/useCases/Vendor/fetchTheatersOfVendor.interface';
import { FetchTheaterOfVendorUseCase } from '../application/useCases/theaterMng/fetchTheaterOfVendor.useCase';
import { IUpdateTheaterUseCase } from '../domain/interfaces/useCases/Vendor/updateTheater.interfase';
import { UpdateTheaterUseCase } from '../application/useCases/theaterMng/updateTheater.useCase';
import { SeatLayoutRepository } from './repositories/seatLayout.repository';
import { CreateSeatLayoutUseCase } from '../application/useCases/seatLayoutMng/createSeatLayout.useCase';
import { ICreateSeatLayoutUseCase } from '../domain/interfaces/useCases/Vendor/createSeatLayout.interface';
import { ISeatLayoutRepository } from '../domain/interfaces/repositories/seatLayout.repository';
import { SeatLayoutController } from '../presentation/controllers/seatLayoutsMng.controller';
import { ISeatLayoutController } from '../presentation/controllers/interface/seatLayoutMng.controller.interface';
import { getUserDetailsUseCase } from '../application/useCases/userProfile/getUserDetail.useCase';
import { IgetUserDetailsUseCase } from '../domain/interfaces/useCases/User/getUserDetails.interface';
import { IupdateUserProfileUseCase } from '../domain/interfaces/useCases/User/updateUserProfile.interface';
import { updateUserProfileUseCase } from '../application/useCases/userProfile/updateUserProfile.useCase';
import { IUserProfileController } from '../presentation/controllers/interface/userProfile.controller.interface';
import { UserProfileController } from '../presentation/controllers/userProfile.controller';
import { IScreenRepository } from '../domain/interfaces/repositories/screen.repository';
import { ICreateScreenUseCase } from '../domain/interfaces/useCases/Vendor/createScreen.interface';
import { IFetchScreensOfVendorUseCase } from '../domain/interfaces/useCases/Vendor/fetchScreenOfVendor.interface';
import { FetchScreensOfVendorUseCase } from '../application/useCases/screenMng/fetchScreensOfVendor.useCase';
import { UpdateScreenUseCase } from '../application/useCases/screenMng/updateScreen.useCase';
import { ScreenRepository } from './repositories/screen.repository';
import { CreateScreenUseCase } from '../application/useCases/screenMng/createScreen.useCase';
import { IScreenManagementController } from '../presentation/controllers/interface/screenMng.controller.interface';
import { IUpdateScreenUseCase } from '../domain/interfaces/useCases/Vendor/updateScreen.interface';
import { ScreenManagementController } from '../presentation/controllers/screenMng.controller';
import { IFindSeatLayoutsByVendorUseCase } from '../domain/interfaces/useCases/Vendor/fetchLayoutsVendor.interface';
import { FindSeatLayoutsByVendorUseCase } from '../application/useCases/seatLayoutMng/fetchLayoutsVendor.useCase';
import { ShowRepository } from './repositories/show.repository';
import { CreateShowUseCase } from '../application/useCases/showMng/createShow.useCase';
import { UpdateShowUseCase } from '../application/useCases/showMng/updateShow.useCase';
import { UpdateShowStatusUseCase } from '../application/useCases/showMng/updateShowStatus.useCase';
import { DeleteShowUseCase } from '../application/useCases/showMng/deleteShow.useCase';
import { FindAllShowsUseCase } from '../application/useCases/showMng/fetchAllShow.useCase';
import { FindShowsByVendorUseCase } from '../application/useCases/showMng/findVendorShows.useCase';
import { ShowManagementController } from '../presentation/controllers/showMng.controller';
import { IShowRepository } from '../domain/interfaces/repositories/show.repository';
import { ICreateShowUseCase } from '../domain/interfaces/useCases/Vendor/createShow.interface';
import { IUpdateShowUseCase } from '../domain/interfaces/useCases/Vendor/updateShow.interface';
import { IUpdateShowStatusUseCase } from '../domain/interfaces/useCases/Vendor/updateShowStatus.interface';
import { IFindAllShowsUseCase } from '../domain/interfaces/useCases/Vendor/fetchAllShow.interface';
import { IFindShowsByVendorUseCase } from '../domain/interfaces/useCases/Vendor/fetchVendorShows.interface';
import { IShowManagementController } from '../presentation/controllers/interface/showMng.controller.interface';
import { IDeleteShowUseCase } from '../domain/interfaces/useCases/Vendor/deleteShow.interface';
import { FindShowByIdUseCase } from '../application/useCases/showMng/findShow.useCase';
import { IFindShowByIdUseCase } from '../domain/interfaces/useCases/Vendor/findShowById.interface';
import { ShowJobService } from './services/showAgenda.service';
import { IFindSeatLayoutByIdUseCase } from '../domain/interfaces/useCases/Vendor/findSeatLayoutById.interface';
import { FindSeatLayoutByIdUseCase } from '../application/useCases/seatLayoutMng/findLayoutById.useCase';
import { IUpdateSeatLayoutUseCase } from '../domain/interfaces/useCases/Vendor/updateSeatLayoutUseCase';
import { UpdateSeatLayoutUseCase } from '../application/useCases/seatLayoutMng/updateSeatLayout.useCase';
import { FetchMoviesUserUseCase } from '../application/useCases/movieMng/fetchMoviesUser.useCase';
import { IFetchMoviesUserUseCase } from '../domain/interfaces/useCases/User/fetchMovieUser.interface';
import { FetchShowSelectionUseCase } from '../application/useCases/showMng/fetchShowSelection.useCase';
import { IFetchShowSelectionUseCase } from '../domain/interfaces/useCases/User/fetchShowSelection.interface';
import { ICreateRecurringShowUseCase } from '../domain/interfaces/useCases/Vendor/createRecurringShow.interface';
import { CreateRecurringShowUseCase } from '../application/useCases/showMng/createRecurringShow.usecase';
import { MoviePassRepository } from './repositories/moviePass.repository';
import { CreateMoviePassUseCase } from '../application/useCases/moviePassMng/createMoviePass.useCase';
import { FetchMoviePassUseCase } from '../application/useCases/moviePassMng/fetchMoviePass.useCase';
import { MoviePassController } from '../presentation/controllers/moviePass.controller';
import { MoviePassJobService } from './services/moviePass.service';
import { StripeWebhookController } from '../presentation/controllers/stripeWebhook.controller';
import { BookingStripeWebhookController } from '../presentation/controllers/bookingStripeWebhook.controller';
import { IMoviePassController } from '../presentation/controllers/interface/moviePass.controller.interface';
import {
  ICreateMoviePassUseCase,
  IFetchMoviePassUseCase,
} from '../domain/interfaces/useCases/User/moviePass.interface';
import { IStripeWebhookController } from '../presentation/controllers/interface/stripeWebhook.controller.interface';
import { NotificationRepository } from './repositories/notification.repository';
import { IMoviePassRepository } from '../domain/interfaces/repositories/moviePass.repository';
import { INotificationRepository } from '../domain/interfaces/repositories/notification.repository';
// import { SocketService } from './services/socket.service';
import { ISeatSelectionController } from '../presentation/controllers/interface/seatSelection.controller.interface';
import { SeatSelectionController } from '../presentation/controllers/seatSelection.controller';
import { IFetchSeatSelectionUseCase } from '../domain/interfaces/useCases/User/fetchSeatSelection.interface';
import { FetchSeatSelectionUseCase } from '../application/useCases/seatLayoutMng/fetchSeatSelection.useCase';
import { ISelectSeatsUseCase } from '../domain/interfaces/useCases/User/selectSeats.interface';
import { SelectSeatsUseCase } from '../application/useCases/seatLayoutMng/selectSeats.useCase';
import { SeatRepository } from './repositories/seat.repository';
import { ISeatRepository } from '../domain/interfaces/repositories/seat.repository';
import { WalletRepository } from './repositories/wallet.repository';
import { IWalletRepository } from '../domain/interfaces/repositories/wallet.repository';
import { BookingRepository } from './repositories/booking.repository';
import { IBookingRepository } from '../domain/interfaces/repositories/booking.repository';
import { CreateBookingUseCase } from '../application/useCases/bookingMng/createBooking.useCase';
import { ICreateBookingUseCase } from '../domain/interfaces/useCases/User/createBooking.interface';
import { FetchAllBookingsUseCase } from '../application/useCases/bookingMng/fetchBooking.useCase';
import { IFetchAllBookingsUseCase } from '../domain/interfaces/useCases/User/fetchBookings.interface';
import { FindBookingsOfUserUseCase } from '../application/useCases/bookingMng/findBookingsOfUser.useCase';
import { IFindBookingByIdUseCase } from '../domain/interfaces/useCases/User/findBookingById.interface';
import { IFindBookingsOfUserUseCase } from '../domain/interfaces/useCases/User/findBookingsOfUser.interface';
import { FindBookingByIdUseCase } from '../application/useCases/bookingMng/findBookingById.useCase';
import { BookingMngController } from '../presentation/controllers/bookingMng.controller';
import { IBookingMngController } from '../presentation/controllers/interface/bookingMng.controller.interface';
import { PaymentService } from './services/checkoutPayment.service';
import { FindUserWalletUseCase } from '../application/useCases/userProfile/findUserWallet.useCase';
import { IFindUserWalletUseCase } from '../domain/interfaces/useCases/User/findUserWallet.interface';
import { NotificationService } from './services/notification.service';
import { INotificationMngController } from '../presentation/controllers/interface/notificationMng.controller.interface';
import { NotificationMngController } from '../presentation/controllers/notificationMng.controller';
import { FindBookingsOfVendorUseCase } from '../application/useCases/bookingMng/fetchVendorBookings';
import { IFindBookingsOfVendorUseCase } from '../domain/interfaces/useCases/User/findBookingsOfVendor.interface';
import { IDashboardController } from '../presentation/controllers/interface/dashboard.controller.interface';
import { FetchDashboardUseCase } from '../application/useCases/dashboardData/fetchVendorDashboard';
import { DashboardRepository } from './repositories/vendorDashboard.repository';
import { DashboardController } from '../presentation/controllers/dashboard.controller';
import { IDashboardRepository } from '../domain/interfaces/repositories/dashboard.repository';
import { IFetchDashboardUseCase } from '../domain/interfaces/useCases/Vendor/fetchDashboard.interface';
import { AdminDashboardRepository } from './repositories/adminDashboard.repository';
import { IAdminDashboardRepository } from '../domain/interfaces/repositories/adminDashboard.repository';
import { FetchAdminDashboardUseCase } from '../application/useCases/dashboardData/fetchAdminDashboard.useCase';
import { IFetchAdminDashboardUseCase } from '../domain/interfaces/useCases/Admin/adminDashboard.interface';
import { ICancelBookingUseCase } from '../domain/interfaces/useCases/User/cancelBooking.interface';
import { CancelBookingUseCase } from '../application/useCases/bookingMng/cancelBooking.useCase';
import { RateMovieUseCase } from '../application/useCases/movieMng/movieRating.useCase';
import { IRateMovieUseCase } from '../domain/interfaces/useCases/User/rateMovie.interface';
import { IChangePasswordUseCase } from '../domain/interfaces/useCases/User/changePassword.interface';
import { ChangePasswordUseCase } from '../application/useCases/userProfile/changePassword.useCase';
import { CloudinaryService } from './services/cloudinary.service';
import { FindUserWalletTransactionsUseCase } from '../application/useCases/userProfile/findUserTransaction.useCase';
import { IFindUserWalletTransactionsUseCase } from '../domain/interfaces/useCases/User/findUserTransaction.interface';
import { FindMoviePassHistoryUseCase } from '../application/useCases/moviePassMng/fetchMoviePassHistory.useCase';
import { IFindMoviePassHistoryUseCase } from '../domain/interfaces/useCases/User/findUserMoviePassHistory.interface';
import { IFetchAdminTheatersUseCase } from '../domain/interfaces/useCases/Admin/fetchAdminTheaters.interface';
import { FetchAdminTheatersUseCase } from '../application/useCases/theaterMng/fetchAdminTheaters.useCase';
import { RedeemLoyalityToWalletUseCase } from '../application/useCases/userProfile/redeemPointsToWallet.useCase';
import { IRedeemLoyalityToWalletUseCase } from '../domain/interfaces/useCases/User/redeemLoyalityToWallet.interface';
import { SmsService } from './services/sms.service';
import { SendOtpPhoneUseCase } from '../application/useCases/userProfile/sendOtpPhone.useCase';
import { VerifyOtpPhoneUseCase } from '../application/useCases/userProfile/verifyOtpPhone.useCase';
import { ISendOtpPhoneUseCase } from '../domain/interfaces/useCases/User/sendOtpPhone.interface';
import { IVerifyOtpPhoneUseCase } from '../domain/interfaces/useCases/User/verifyOtpPhone.interface';
import { IProcessVendorPayout } from '../domain/interfaces/useCases/User/ProcessVendorPayoutUseCase.interface';
import { ProcessVendorPayoutUseCase } from '../application/useCases/bookingMng/ProcessVendorPayout';
import { FindTheaterByIdUseCase } from '../application/useCases/theaterMng/findTheaterById.useCase';
import { IFindTheaterByIdUseCase } from '../domain/interfaces/useCases/Vendor/findTheaterById.interface';
import { IFindProfileContentsUseCase } from '../domain/interfaces/useCases/User/findProfileContents.interface';
import { FindProfileContentsUseCase } from '../application/useCases/userProfile/getProfileContents.useCase';
import { ICheckPaymentOptionsUseCase } from '../domain/interfaces/useCases/User/checkPaymentOptions.interface';
import { CheckPaymentOptionsUseCase } from '../application/useCases/bookingMng/checkPaymentOptions.useCase';
import { ILikeOrUnlikeMovieUseCase } from '../domain/interfaces/useCases/User/likeOrUnlikeMovie.interface';
import { LikeOrUnlikeMovieUseCase } from '../application/useCases/movieMng/likeOrUnlikeMovie.useCase';
import { IsMovieLikedUseCase } from '../application/useCases/movieMng/isMovieLiked.useCase';
import { IIsMovieLikedUseCase } from '../domain/interfaces/useCases/User/isMovieLiked.interface';
import { IRefreshTokenUseCase } from '../domain/interfaces/useCases/User/refreshToken.interface';
import { RefreshTokenUseCase } from '../application/useCases/userAuth/refreshToken.useCase';
import { IWithdrawFundsUseCase } from '../domain/interfaces/useCases/Vendor/withdrawFunds.interface';
import { WithdrawFundsUseCase } from '../application/useCases/userProfile/withdrawFunds.usecase';
// import { VendorPayoutJobService } from './services/scheduleVendorPayouts.service';

//Controller Registration
container.register<IUserAuthController>('UserAuthController', { useClass: UserAuthController });

container.register<IVendorAuthController>('VendorAuthController', {
  useClass: VendorAuthController,
});

container.register<IAdminAuthController>('AdminAuthController', { useClass: AdminAuthController });

//UseCase Registration
container.register<ISendOtpUseCase>('SendOtpUserUseCase', { useClass: SendOtpUseCase });
container.register<IVerifyOtpUseCase>('VerifyOtpUserUseCase', { useClass: VerifyOtpUseCase });
container.register<IGoogleAuthUseCase>('GoogleAuthUseCase', { useClass: GoogleAuthUseCase });
container.register<ILoginUserUseCase>('LoginUserUseCase', { useClass: LoginUserUseCase });
// container.register<IVerifyOtpUseCase>('VerifyOtpUserUseCase', { useClass: VerifyOtpUseCase });

container.register<ILoginAdminUseCase>('LoginAdminUseCase', { useClass: LoginAdminUseCase });
container.register<IForgotPasswordSendOtpUseCase>('ForgotPassSendOtp', {
  useClass: ForgotPasswordSendOtpUseCase,
});
container.register<IForgotPasswordUpdateUseCase>('ForgotPassUpdate', {
  useClass: ForgotPasswordUpdateUseCase,
});
container.register<IForgotPasswordVerifyOtpUseCase>('ForgotPassVerifyOtp', {
  useClass: ForgotPasswordVerifyOtpUseCase,
});

container.register<ISendOtpVendorUseCase>('SendOtpVendorUseCase', {
  useClass: sendOtpVendorUseCase,
});
container.register<IVerifyOtpVendorUseCase>('VerifyOtpVendorUseCase', {
  useClass: VerifyOtpVendorUseCase,
});
container.register<ILoginVendorUseCase>('LoginVendorUseCase', { useClass: LoginVendorUseCase });
container.register<IRefreshTokenUseCase>('RefreshTokenUseCase', { useClass: RefreshTokenUseCase });

// Repository Registration
container.register<IAuthRepository>('AuthRepository', { useClass: AuthRepository });
container.register<ITheaterRepository>('TheaterRepository', { useClass: TheaterRepository });
container.register<IUserRepository>('IUserRepository', { useClass: UserRepositoryImpl });

// Services Registration
container.register('RedisService', { useClass: RedisService });
container.register('JwtService', { useClass: JwtService });
container.register('FacebookService', { useClass: FacebookService });
container.register<JwtService>('JwtService', { useClass: JwtService });
container.register<RedisService>('RedisService', { useClass: RedisService });

// Movie Management UseCases and Controller Registration
container.register<IMovieRepository>('MovieRepository', { useClass: MovieRepository });
container.register<ICreateMovieUseCase>('CreateMovieUseCase', { useClass: CreateMovieUseCase });
container.register<IFetchMoviesUseCase>('FetchMoviesUseCase', { useClass: FetchMoviesUseCase });
container.register<IUpdateMovieStatusUseCase>('UpdateMovieStatusUseCase', {
  useClass: UpdateMovieStatusUseCase,
});
container.register<IUpdateMovieUseCase>('UpdateMovieUseCase', { useClass: UpdateMovieUseCase });
container.register<IMovieMngController>('MovieMngController', { useClass: MovieMngController });
container.register<IFindMovieByIdUseCase>('FindMovieByIdUseCase', {
  useClass: FindMovieByIdUseCase,
});
container.register<IFetchMoviesUserUseCase>('FetchMoviesUserUseCase', {
  useClass: FetchMoviesUserUseCase,
});
container.register<IRateMovieUseCase>('RateMovieUseCase', {
  useClass: RateMovieUseCase,
});
container.register<ILikeOrUnlikeMovieUseCase>('LikeOrUnlikeMovieUseCase', {
  useClass: LikeOrUnlikeMovieUseCase,
});
container.register<IIsMovieLikedUseCase>('IsMovieLikedUseCase', {
  useClass: IsMovieLikedUseCase,
});

// User Management UseCases and Controller Registration
container.register<IFetchUsersUseCase>('FetchUsersUseCase', { useClass: FetchUsersUseCase });
container.register<IUpdateUserBlockStatusUseCase>('UpdateUserBlockStatusUseCase', {
  useClass: UpdateUserBlockStatusUseCase,
});
container.register<IUserManagementController>('UserManagementController', {
  useClass: UserManagementController,
});

//Theater Management UseCases and Controller Registration
container.register<ITheaterManagementController>('TheaterMngController', {
  useClass: TheaterManagementController,
});
container.register<ICreateNewTheaterUseCase>('CreateTheaterUseCase', {
  useClass: CreateNewTheaterUseCase,
});
container.register<IFetchTheatersUseCase>('FetchTheatersUseCase', {
  useClass: FetchTheatersUseCase,
});
container.register<IUpdateTheaterStatusUseCase>('UpdateTheaterStatus', {
  useClass: UpdateTheaterStatusUseCase,
});
container.register<IUpdateTheaterUseCase>('UpdateTheater', { useClass: UpdateTheaterUseCase });
container.register<IFetchTheaterOfVendorUseCase>('FetchTheaterOfVendorUseCase', {
  useClass: FetchTheaterOfVendorUseCase,
});
container.register<IFetchAdminTheatersUseCase>('FetchAdminTheatersUseCase', {
  useClass: FetchAdminTheatersUseCase,
});
container.register<IFindTheaterByIdUseCase>('FindTheaterByIdUseCase', {
  useClass: FindTheaterByIdUseCase,
});

// Seat Layout UseCases and Controller Registration
container.register<ICreateSeatLayoutUseCase>('CreateSeatLayoutUseCase', {
  useClass: CreateSeatLayoutUseCase,
});
container.register<ISeatLayoutRepository>('SeatLayoutRepository', {
  useClass: SeatLayoutRepository,
});
container.register<ISeatLayoutController>('SeatLayoutController', {
  useClass: SeatLayoutController,
});
container.register<IFindSeatLayoutsByVendorUseCase>('FindSeatLayoutsByVendorUseCase', {
  useClass: FindSeatLayoutsByVendorUseCase,
});
container.register<IUpdateSeatLayoutUseCase>('UpdateSeatLayoutUseCase', {
  useClass: UpdateSeatLayoutUseCase,
});
container.register<IFindSeatLayoutByIdUseCase>('FindSeatLayoutByIdUseCase', {
  useClass: FindSeatLayoutByIdUseCase,
});

// User Profile UseCase,Controller Registration
container.register<IupdateUserProfileUseCase>('UpdateUserProfileUseCase', {
  useClass: updateUserProfileUseCase,
});
container.register<IChangePasswordUseCase>('ChangePasswordUseCase', {
  useClass: ChangePasswordUseCase,
});
container.register<IgetUserDetailsUseCase>('GetUserDetailsUseCase', {
  useClass: getUserDetailsUseCase,
});
container.register<IFindProfileContentsUseCase>('FindProfileContentsUseCase', {
  useClass: FindProfileContentsUseCase,
});
container.register<IRedeemLoyalityToWalletUseCase>('RedeemLoyalityToWalletUseCase', {
  useClass: RedeemLoyalityToWalletUseCase,
});
container.register<IUserProfileController>('UserProfileController', {
  useClass: UserProfileController,
});
container.register('SmsService', { useClass: SmsService });
container.register<ISendOtpPhoneUseCase>('SendOtpPhoneUseCase', { useClass: SendOtpPhoneUseCase });
container.register<IVerifyOtpPhoneUseCase>('VerifyOtpPhoneUseCase', {
  useClass: VerifyOtpPhoneUseCase,
});
container.register<IWithdrawFundsUseCase>('WithdrawFundsUseCase', {
  useClass: WithdrawFundsUseCase,
});

// Screen Management UseCase, Controller, Repository Registration
container.register<IScreenRepository>('ScreenRepository', { useClass: ScreenRepository });
container.register<ICreateScreenUseCase>('CreateScreenUseCase', { useClass: CreateScreenUseCase });
container.register<IFetchScreensOfVendorUseCase>('FetchScreensOfVendorUseCase', {
  useClass: FetchScreensOfVendorUseCase,
});
container.register<IUpdateScreenUseCase>('UpdateScreenUseCase', { useClass: UpdateScreenUseCase });
container.register<IScreenManagementController>('ScreenManagementController', {
  useClass: ScreenManagementController,
});

// Show Management UseCase, Controller, Repository Registration
container.register<IShowRepository>('ShowRepository', { useClass: ShowRepository });
container.register<ICreateShowUseCase>('CreateShowUseCase', { useClass: CreateShowUseCase });
container.register<ICreateRecurringShowUseCase>('CreateRecurringShowUseCase', {
  useClass: CreateRecurringShowUseCase,
});
container.register<IUpdateShowUseCase>('UpdateShowUseCase', { useClass: UpdateShowUseCase });
container.register<IUpdateShowStatusUseCase>('UpdateShowStatusUseCase', {
  useClass: UpdateShowStatusUseCase,
});
container.register<IDeleteShowUseCase>('DeleteShowUseCase', { useClass: DeleteShowUseCase });
container.register<IFindShowByIdUseCase>('FindShowByIdUseCase', { useClass: FindShowByIdUseCase });
container.register<IFindAllShowsUseCase>('FindAllShowsUseCase', { useClass: FindAllShowsUseCase });
container.register<IFindShowsByVendorUseCase>('FindShowsByVendorUseCase', {
  useClass: FindShowsByVendorUseCase,
});
container.register<IShowManagementController>('ShowManagementController', {
  useClass: ShowManagementController,
});
container.register<IFetchShowSelectionUseCase>('FetchShowSelectionUseCase', {
  useClass: FetchShowSelectionUseCase,
});
container.register('ShowJobService', { useClass: ShowJobService });

// MoviePass Management UseCase,Payment,Controller,Repository Registration
container.register<IMoviePassRepository>('MoviePassRepository', { useClass: MoviePassRepository });
container.register<INotificationRepository>('NotificationRepository', {
  useClass: NotificationRepository,
});
container.register<ICreateMoviePassUseCase>('CreateMoviePassUseCase', {
  useClass: CreateMoviePassUseCase,
});
container.register<IFetchMoviePassUseCase>('FetchMoviePassUseCase', {
  useClass: FetchMoviePassUseCase,
});
container.register<IFindMoviePassHistoryUseCase>('FindMoviePassHistoryUseCase', {
  useClass: FindMoviePassHistoryUseCase,
});
container.register<IMoviePassController>('MoviePassController', { useClass: MoviePassController });
container.register<IStripeWebhookController>('StripeWebhookController', {
  useClass: StripeWebhookController,
});
container.register('MoviePassJobService', { useClass: MoviePassJobService });
// container.register('VendorPayoutJobService', { useClass: VendorPayoutJobService });

// Seat Selevtion Service, Repository, Controller and useCase Registration
container.register<ISeatSelectionController>('SeatSelectionController', {
  useClass: SeatSelectionController,
});
container.register<IFetchSeatSelectionUseCase>('FetchSeatSelectionUseCase', {
  useClass: FetchSeatSelectionUseCase,
});
container.register<ISelectSeatsUseCase>('SelectSeatsUseCase', { useClass: SelectSeatsUseCase });
container.register<ISeatRepository>('SeatRepository', { useClass: SeatRepository });
// container.registerSingleton('SocketService', SocketService);
// container.registerSingleton<SocketService>(SocketService);
// container.register('SocketService', { useClass: SocketService });
container.registerSingleton('ShowRepository', ShowRepository);
container.registerSingleton('SeatLayoutRepository', SeatLayoutRepository);
container.registerSingleton('ScreenRepository', ScreenRepository);
container.registerSingleton('SeatRepository', SeatRepository);
container.registerSingleton('ShowJobService', ShowJobService);
// Wallet Repository Registration
container.register<IWalletRepository>('WalletRepository', { useClass: WalletRepository });
container.register<IFindUserWalletUseCase>('FindUserWalletUseCase', {
  useClass: FindUserWalletUseCase,
});
container.register<IFindUserWalletTransactionsUseCase>('WalletTransactionUseCase', {
  useClass: FindUserWalletTransactionsUseCase,
});

// Booking Repository,Controller,UseCase Registration
container.register<IBookingRepository>('BookingRepository', { useClass: BookingRepository });
container.register<ICreateBookingUseCase>('CreateBookingUseCase', {
  useClass: CreateBookingUseCase,
});
container.register<IFetchAllBookingsUseCase>('FetchAllBookingsUseCase', {
  useClass: FetchAllBookingsUseCase,
});
container.register<IFindBookingByIdUseCase>('FindBookingByIdUseCase', {
  useClass: FindBookingByIdUseCase,
});
container.register<IFindBookingsOfUserUseCase>('FindBookingsOfUserUseCase', {
  useClass: FindBookingsOfUserUseCase,
});
container.register<ICancelBookingUseCase>('CancelBookingUseCase', {
  useClass: CancelBookingUseCase,
});
container.register<IFindBookingsOfVendorUseCase>('FindBookingsOfVendorUseCase', {
  useClass: FindBookingsOfVendorUseCase,
});
container.register<ICheckPaymentOptionsUseCase>('CheckPaymentOptionsUseCase', {
  useClass: CheckPaymentOptionsUseCase,
});
container.register<IBookingMngController>('BookingMngController', {
  useClass: BookingMngController,
});
container.register('PaymentService', { useClass: PaymentService });
container.register('CloudinaryService', { useClass: CloudinaryService });
container.register('BookingStripeWebhookController', { useClass: BookingStripeWebhookController });
container.register<IProcessVendorPayout>('IProcessVendorPayout', {
  useClass: ProcessVendorPayoutUseCase,
});

// Notification Service Registration
container.register('NotificationService', { useClass: NotificationService });
container.register<INotificationMngController>('NotificationMngController', {
  useClass: NotificationMngController,
});

// DashBoard Data UseCase,Controller,Repository Registration
container.register<IDashboardRepository>('DashboardRepository', { useClass: DashboardRepository });
container.register<IFetchDashboardUseCase>('FetchDashboardUseCase', {
  useClass: FetchDashboardUseCase,
});
container.register<IFetchAdminDashboardUseCase>('FetchAdminDashboardUseCase', {
  useClass: FetchAdminDashboardUseCase,
});
container.register<IDashboardController>('DashboardController', { useClass: DashboardController });
container.register<IAdminDashboardRepository>('AdminDashboardRepository', {
  useClass: AdminDashboardRepository,
});

export { container };
