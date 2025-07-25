import { injectable, inject } from 'tsyringe';
import { RedisService } from '../../../infrastructure/services/redis.service';
import { CustomError } from '../../../utils/errors/custom.error';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { IVerifyOtpPhoneUseCase } from '../../../domain/interfaces/useCases/User/verifyOtpPhone.interface';
import { VerifyOtpPhoneRequestDTO } from '../../dtos/profile.dto';

@injectable()
export class VerifyOtpPhoneUseCase implements IVerifyOtpPhoneUseCase {
  constructor(@inject('RedisService') private redisService: RedisService) {}

  async execute(dto: VerifyOtpPhoneRequestDTO): Promise<void> {
    const otpKey = `otp:phone:${dto.phone}:${dto.userId}`;
    const storedOtp = await this.redisService.get(otpKey);

    if (!storedOtp || storedOtp !== dto.otp) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION.INVALID_OTP, HttpResCode.BAD_REQUEST);
    }

    await this.redisService.del(otpKey);
    console.log('VerifyOtpPhoneUseCase: OTP verified and deleted from Redis:', { otpKey });
  }
}
