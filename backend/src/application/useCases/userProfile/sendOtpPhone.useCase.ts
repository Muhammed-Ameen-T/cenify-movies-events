import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { RedisService } from '../../../infrastructure/services/redis.service';
import { SmsService } from '../../../infrastructure/services/sms.service';
import { CustomError } from '../../../utils/errors/custom.error';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { generateOtp } from '../../../utils/helpers/otp.utils';
import { ISendOtpPhoneUseCase } from '../../../domain/interfaces/useCases/User/sendOtpPhone.interface';
import { SendOtpPhoneRequestDTO } from '../../dtos/profile.dto';

@injectable()
export class SendOtpPhoneUseCase implements ISendOtpPhoneUseCase {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('RedisService') private redisService: RedisService,
    @inject('SmsService') private smsService: SmsService,
  ) {}

  async execute(dto:SendOtpPhoneRequestDTO): Promise<void> {
    const parsedPhone = parseInt(dto.phone,10)
    // Check if phone number is already in use by another user
    const existingUser = await this.userRepository.findByPhone(parsedPhone);


    const otp = generateOtp(6);
    const otpKey = `otp:phone:${dto.phone}:${dto.userId}`;

    try {
      await this.redisService.set(otpKey, otp, 300); // 5-minute expiry
      console.log('SendOtpPhoneUseCase: Stored OTP in Redis:', { otpKey, otp });
    } catch (error) {
      console.error('SendOtpPhoneUseCase: Redis error:', error);
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.FAILED_STORING_OTP,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      await this.smsService.sendSms(dto.phone, `Your OTP is ${otp}. It is valid for 5 minutes.`);
      console.log('SendOtpPhoneUseCase: OTP SMS sent to:', dto.phone);
    } catch (error) {
      console.error('SendOtpPhoneUseCase: SMS service error:', error);
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_SENDING_OTP,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}