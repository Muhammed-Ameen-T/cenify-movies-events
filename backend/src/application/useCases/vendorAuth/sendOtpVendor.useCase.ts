import { injectable, inject } from 'tsyringe';
import { IVendorRepository } from '../../../domain/interfaces/repositories/vendor.repository';
import { RedisService } from '../../../infrastructure/services/redis.service';
import { CustomError } from '../../../utils/errors/custome.error';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { SendOtpVendorDTO } from '../../dtos/vendor.dto';
import { generateOtp } from '../../../utils/helpers/otp.utils';
import { sendOtp } from '../../../infrastructure/services/sendOtp.service';


@injectable()
export class sendOtpVendorUseCase {
  constructor(
    @inject('VendorRepository') private vendorRepository: IVendorRepository,
    @inject('RedisService') private redisService: RedisService,
  ) {}

  async execute(dto: SendOtpVendorDTO) {
    const existingTheater = await this.vendorRepository.findByEmail(dto.email);
    if (existingTheater) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION.USER_ALREADY_EXISTS, HttpResCode.BAD_REQUEST);
    }

    const otp = generateOtp(6);
    const otpKey = `otp:${dto.email}`;

    try {
      await this.redisService.set(otpKey, otp, 300);
      console.log('RegisterTheaterUseCase: Stored OTP in Redis:', { otpKey, otp });
    } catch (error) {
      console.error('RegisterTheaterUseCase: Redis error:', error);
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.FAILED_STORING_OTP,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      await sendOtp(dto.email, otp);
      console.log('RegisterTheaterUseCase: OTP email sent to:', dto.email);
    } catch (error) {
      console.error('RegisterTheaterUseCase: Email service error:', error);
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_SENDING_OTP,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}