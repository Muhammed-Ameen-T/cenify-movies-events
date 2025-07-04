import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { IForgotPasswordSendOtpUseCase } from '../../../domain/interfaces/useCases/Admin/forgotPasswordSendOtp.interface';
import { RedisService } from '../../../infrastructure/services/redis.service';
import { sendOtp } from '../../../infrastructure/services/sendOtp.service';
import { CustomError } from '../../../utils/errors/custom.error';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { generateOtp } from '../../../utils/helpers/otp.utils';

/**
 * Use case for requesting a password reset by sending an OTP to the user's email.
 */
@injectable()
export class ForgotPasswordSendOtpUseCase implements IForgotPasswordSendOtpUseCase {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('RedisService') private redisService: RedisService,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND, HttpResCode.NOT_FOUND);
    }

    const otp = generateOtp(6);
    const otpKey = `reset-otp:${email}`;

    try {
      await this.redisService.set(otpKey, otp, 300); // 5 minutes expiry
      console.log('RequestPasswordResetUseCase: Stored OTP in Redis:', { otpKey, otp });
    } catch (error) {
      console.error('RequestPasswordResetUseCase: Redis error:', error);
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.FAILED_STORING_OTP,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      await sendOtp(email, otp);
      console.log('RequestPasswordResetUseCase: OTP email sent to:', email);
    } catch (error) {
      console.error('RequestPasswordResetUseCase: Email service error:', error);
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_SENDING_OTP,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
