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
import { IVendorAuthController } from '../presentation/controllers/interface/theaterAuth.controller.interface';
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
import { IUpdateVendorDetailsUseCase } from '../domain/interfaces/useCases/Vendor/updateVendorDetails.interface';
import { UpdateVendorDetailsUseCase } from '../application/useCases/vendorAuth/updateVendorDetails.useCase';
import { ITheaterRepository } from '../domain/interfaces/repositories/theater.repository';
import { TheaterRepository } from './repositories/theater.repository';
import { ITheaterManagementController } from '../presentation/controllers/interface/theaterMng.controller.interface';
import { TheaterManagementController } from '../presentation/controllers/theaterMng.controller';
import { IFetchTheatersUseCase } from '../domain/interfaces/useCases/Vendor/fetchTheaters.interface';
import { FetchTheatersUseCase } from '../application/useCases/vendorAuth/fetchTheaters.useCase';
import { IUpdateTheaterStatusUseCase } from '../domain/interfaces/useCases/Vendor/updateTheaterStatus.interface';
import { UpdateTheaterStatusUseCase } from '../application/useCases/vendorAuth/updateTheaterStatus.useCase';
import { IForgotPasswordSendOtpUseCase } from '../domain/interfaces/useCases/Admin/forgotPasswordSendOtp.interface';
import { ForgotPasswordSendOtpUseCase } from '../application/useCases/adminAuth/forgotPassSendOtp.useCase';
import { IForgotPasswordUpdateUseCase } from '../domain/interfaces/useCases/Admin/forgotPasswordUpdate.interface';
import { ForgotPasswordUpdateUseCase } from '../application/useCases/adminAuth/forgotPassUpdate.useCase';
import { ForgotPasswordVerifyOtpUseCase } from '../application/useCases/adminAuth/forgotPassVerifyOtp.useCase';
import { IForgotPasswordVerifyOtpUseCase } from '../domain/interfaces/useCases/Admin/forgotPasswordVerifyOtp.interface';

//Controller Registration
container.register<IUserAuthController>('UserAuthController', { useClass: UserAuthController });

container.register<IVendorAuthController>('VendorAuthController', { useClass: VendorAuthController});

container.register<IAdminAuthController>('AdminAuthController', { useClass: AdminAuthController });

container.register<ITheaterManagementController>('TheaterMngController', {useClass: TheaterManagementController})

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
container.register<IUpdateVendorDetailsUseCase>('UpdateVendorDetailsUseCase', { useClass: UpdateVendorDetailsUseCase});
container.register<IFetchTheatersUseCase>('FetchTheatersUseCase', {useClass: FetchTheatersUseCase});
container.register<IUpdateTheaterStatusUseCase>('UpdateTheaterStatus', {useClass: UpdateTheaterStatusUseCase});

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

export { container };
