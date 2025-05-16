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

//Controller Registration
container.register<IUserAuthController>('UserAuthController', { useClass: UserAuthController });

container.register<IVendorAuthController>('VendorAuthController', { useClass: VendorAuthController});

container.register<IAdminAuthController>('AdminAuthController', { useClass: AdminAuthController });


//UseCase Registration
container.register<ISendOtpUseCase>('SendOtpUserUseCase', { useClass: SendOtpUseCase });
container.register<IVerifyOtpUseCase>('VerifyOtpUserUseCase', { useClass: VerifyOtpUseCase });
container.register<IGoogleAuthUseCase>('GoogleAuthUseCase', { useClass: GoogleAuthUseCase });
container.register<ILoginUserUseCase>('LoginUserUseCase', { useClass: LoginUserUseCase });
// container.register<IVerifyOtpUseCase>('VerifyOtpUserUseCase', { useClass: VerifyOtpUseCase });

container.register<ILoginAdminUseCase>('LoginAdminUseCase', { useClass: LoginAdminUseCase });
container.register<IForgotPasswordSendOtpUseCase>('ForgotPassSendOtp', { useClass: ForgotPasswordSendOtpUseCase });
container.register<IForgotPasswordUpdateUseCase>('ForgotPassUpdate', {useClass: ForgotPasswordUpdateUseCase});
container.register<IForgotPasswordVerifyOtpUseCase>('ForgotPassVerifyOtp', {useClass: ForgotPasswordVerifyOtpUseCase});

container.register<ISendOtpVendorUseCase>('SendOtpVendorUseCase', { useClass: sendOtpVendorUseCase });
container.register<IVerifyOtpVendorUseCase>('VerifyOtpVendorUseCase', { useClass: VerifyOtpVendorUseCase});
container.register<ILoginVendorUseCase>('LoginVendorUseCase', { useClass: LoginVendorUseCase });

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
container.register<IUpdateMovieStatusUseCase>('UpdateMovieStatusUseCase', { useClass: UpdateMovieStatusUseCase });
container.register<IUpdateMovieUseCase>('UpdateMovieUseCase', { useClass: UpdateMovieUseCase });
container.register<IMovieMngController>('MovieMngController', { useClass: MovieMngController });
container.register<IFindMovieByIdUseCase>('FindMovieByIdUseCase', { useClass: FindMovieByIdUseCase });


// User Management UseCases and Controller Registration
container.register<IFetchUsersUseCase>('FetchUsersUseCase', { useClass: FetchUsersUseCase });
container.register<IUpdateUserBlockStatusUseCase>('UpdateUserBlockStatusUseCase', { useClass: UpdateUserBlockStatusUseCase });
container.register<IUserManagementController>('UserManagementController', { useClass: UserManagementController });

//Theater Management UseCases and Controller Registration
container.register<ITheaterManagementController>('TheaterMngController', {useClass: TheaterManagementController})
container.register<ICreateNewTheaterUseCase>('CreateTheaterUseCase', { useClass: CreateNewTheaterUseCase});
container.register<IFetchTheatersUseCase>('FetchTheatersUseCase', {useClass: FetchTheatersUseCase});
container.register<IUpdateTheaterStatusUseCase>('UpdateTheaterStatus', {useClass: UpdateTheaterStatusUseCase});
container.register<IUpdateTheaterUseCase>('UpdateTheater', {useClass: UpdateTheaterUseCase});
container.register<IFetchTheaterOfVendorUseCase>('FetchTheaterOfVendorUseCase', { useClass: FetchTheaterOfVendorUseCase });

// Seat Layout UseCases and Controller Registration
container.register<ICreateSeatLayoutUseCase>('CreateSeatLayoutUseCase', { useClass: CreateSeatLayoutUseCase });
container.register<ISeatLayoutRepository>('SeatLayoutRepository', { useClass: SeatLayoutRepository});
container.register<ISeatLayoutController>('SeatLayoutController', { useClass: SeatLayoutController });

// User Profile UseCase Registration
container.register<IupdateUserProfileUseCase>('UpdateUserProfileUseCase', { useClass: updateUserProfileUseCase });
container.register<IgetUserDetailsUseCase>('GetUserDetailsUseCase', { useClass: getUserDetailsUseCase });
container.register<IUserProfileController>('UserProfileController', { useClass: UserProfileController });

export { container };
