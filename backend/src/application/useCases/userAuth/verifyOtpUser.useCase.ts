import { injectable, inject } from 'tsyringe';
import { IVerifyOtpUseCase } from '../../../domain/interfaces/useCases/User/verifyOtpUser.interface';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { JwtService } from '../../../infrastructure/services/jwt.service';
import { RedisService } from '../../../infrastructure/services/redis.service';
import { CustomError } from '../../../utils/errors/custom.error';
import { AuthResponseDTO } from '../../dtos/auth.dto';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { User } from '../../../domain/entities/user.entity';
import { VerifyOtpDTO } from '../../../application/dtos/auth.dto';
import bcrypt from 'bcryptjs';
import { IWalletRepository } from '../../../domain/interfaces/repositories/wallet.repository';
import { Wallet } from '../../../domain/entities/wallet.entity';

/**
 * Use case for verifying OTP during user registration.
 * Validates the OTP, creates a new user, and generates authentication tokens.
 */
@injectable()
export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  /**
   * Initializes the VerifyOtpUseCase with dependencies for user repository, JWT service, and Redis service.
   *
   * @param {IUserRepository} authRepository - Repository for user management.
   * @param {JwtService} jwtService - Service for JWT handling.
   * @param {RedisService} redisService - Service for storing and retrieving OTPs.
   */
  constructor(
    @inject('IUserRepository') private _authRepository: IUserRepository,
    @inject('JwtService') private _jwtService: JwtService,
    @inject('WalletRepository') private _walletRepository: IWalletRepository,
    @inject('RedisService') private _redisService: RedisService,
  ) {}

  /**
   * Executes the OTP verification process.
   * Checks if the stored OTP matches the provided OTP, registers the user, and generates authentication tokens.
   *
   * @param {VerifyOtpDTO} dto - DTO containing user details and OTP for verification.
   * @returns {Promise<AuthResponseDTO>} Returns authentication tokens and user details if OTP validation succeeds.
   * @throws {CustomError} If OTP is invalid or user creation fails.
   */
  async execute(dto: VerifyOtpDTO): Promise<AuthResponseDTO> {
    console.log(dto);
    const storedOtp = await this._redisService.get(`otp:${dto.email}`);

    console.log('storedOtp:', storedOtp);

    if (!storedOtp || storedOtp != dto.otp) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION.INVALID_OTP, HttpResCode.BAD_REQUEST);
    }

    await this._redisService.del(`otp:${dto.email}`);

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create new user
    let user = new User(
      null,
      dto.name,
      dto.email,
      null,
      null,
      hashedPassword,
      null,
      null,
      { buyDate: null, expiryDate: null, isPass: null },
      0,
      false,
      'user',
      new Date(),
      new Date(),
    );

    const savedUser = await this._authRepository.create(user);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const createdUser = await this._authRepository.findByEmail(user.email.toLocaleLowerCase());
    console.log('newcreatedUser:', createdUser);
    if (!createdUser) {
      throw new CustomError(
        ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    const newWallet = new Wallet(
      null,
      createdUser._id ? createdUser._id.toString() : '',
      0,
      [],
      new Date(),
      new Date(),
    );
    await this._walletRepository.createWallet(newWallet);

    const accessToken = this._jwtService.generateAccessToken(createdUser._id ? createdUser._id.toString() : '', 'user');
    const refreshToken = this._jwtService.generateRefreshToken(createdUser._id ? createdUser._id.toString() : '', 'user');

    return new AuthResponseDTO(accessToken, refreshToken, {
      id: createdUser._id ? createdUser._id.toString() : '',
      email: createdUser.email,
      name: createdUser.name,
      phone: createdUser.phone,
      profileImage: createdUser.profileImage,
      role: createdUser.role,
    });
  }
}
