import { injectable, inject } from 'tsyringe';
import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';
import { VerifyOtpVendorDTO } from '../../dtos/vendor.dto';
import { JwtService } from '../../../infrastructure/services/jwt.service';
import { RedisService } from '../../../infrastructure/services/redis.service';
import { CustomError } from '../../../utils/errors/custom.error';
import { AuthResponseDTO } from '../../dtos/auth.dto';
import { IVerifyOtpVendorUseCase } from '../../../domain/interfaces/useCases/Vendor/verifyOtpVendor.interface';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { Theater } from '../../../domain/entities/theater.entity';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { hashPassword } from '../../../utils/helpers/hash.utils';
import { User } from '../../../domain/entities/user.entity';

@injectable()
export class VerifyOtpVendorUseCase implements IVerifyOtpVendorUseCase {
  constructor(
    @inject('TheaterRepository') private vendorRepository: ITheaterRepository,
    @inject('JwtService') private jwtService: JwtService,
    @inject('RedisService') private redisService: RedisService,
    @inject('IUserRepository') private authRepository: IUserRepository,
  ) {}

  async execute(dto: VerifyOtpVendorDTO): Promise<AuthResponseDTO> {
    const storedOtp = await this.redisService.get(`otp:${dto.email}`);
    console.log('storedOtp:', storedOtp);
    if (!storedOtp) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION.INVALID_OTP, HttpResCode.BAD_REQUEST);
    }

    const existingTheater = await this.vendorRepository.findByEmail(dto.email);
    if (existingTheater) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION.USER_ALREADY_EXISTS, HttpResCode.BAD_REQUEST);
    }

    const hashedPassword = await hashPassword(dto.password);

    let vendor = new User(
      null as any,
      dto.name,
      dto.email,
      dto.phone,
      null,
      hashedPassword,
      null,
      null,
      { buyDate: null, expiryDate: null, isPass: null },
      0,
      false,
      'vendor',
      new Date(),
      new Date(),
    );
    console.log('sadas');

    try {
      const created = await this.authRepository.create(vendor);
    } catch (error) {
      console.log(error);
    }

    const createdVendor = await this.authRepository.findByEmail(dto.email);
    console.log('created Vendor:', createdVendor);
    if (!createdVendor) {
      throw new CustomError(
        ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }

    // Generate JWT tokens
    const accessToken = this.jwtService.generateAccessToken(
      createdVendor._id.toString(),
      createdVendor.role,
    );
    const refreshToken = this.jwtService.generateRefreshToken(
      createdVendor._id.toString(),
      createdVendor.role,
    );
    await this.redisService.del(`otp:${dto.email}`);

    return new AuthResponseDTO(accessToken, refreshToken, {
      id: createdVendor._id.toString(),
      email: createdVendor.email,
      name: createdVendor.name,
      phone: createdVendor.phone,
      profileImage: createdVendor.profileImage,
      role: createdVendor.role,
    });
  }
}
