import { injectable, inject } from 'tsyringe';
import { IForgotPasswordVerifyOtpUseCase } from '../../../domain/interfaces/useCases/Admin/forgotPasswordVerifyOtp.interface';
import { RedisService } from '../../../infrastructure/services/redis.service';
import { CustomError } from '../../../utils/errors/custom.error';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';

/**
 * Use case for verifying the OTP sent for password reset.
 */
@injectable()
export class ForgotPasswordVerifyOtpUseCase implements IForgotPasswordVerifyOtpUseCase {
  constructor(@inject('RedisService') private redisService: RedisService) {}

  async execute(email: string, otp: string): Promise<void> {
    const otpKey = `reset-otp:${email}`;
    const storedOtp = await this.redisService.get(otpKey);

    if (!storedOtp || storedOtp !== otp) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION.INVALID_OTP, HttpResCode.BAD_REQUEST);
    }

    try {
      await this.redisService.del(otpKey); // Invalidate OTP after verification
      console.log('VerifyOtpUseCase: OTP verified and deleted from Redis:', { otpKey });
    } catch (error) {
      console.error('VerifyOtpUseCase: Redis error:', error);
      throw new CustomError('Failed to delete OTP from Redis', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }
}
