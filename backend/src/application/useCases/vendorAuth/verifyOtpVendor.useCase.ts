import { injectable, inject } from 'tsyringe';
import { IVendorRepository } from '../../../domain/interfaces/repositories/vendor.repository';
import { VerifyOtpVendorDTO } from '../../dtos/vendor.dto';
import { JwtService } from '../../../infrastructure/services/jwt.service';
import { RedisService } from '../../../infrastructure/services/redis.service';
import { CustomError } from '../../../utils/errors/custome.error';
import { AuthResponseDTO } from '../../dtos/auth.dto';
import { IVerifyOtpVendorUseCase } from '../../../domain/interfaces/useCases/Vendor/verifyOtpVendor.interface';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { Vendor } from '../../../domain/entities/vendor.entity';
import bcrypt from 'bcrypt';

@injectable()
export class VerifyOtpVendorUseCase implements IVerifyOtpVendorUseCase {
  constructor(
    @inject('VendorRepository') private vendorRepository: IVendorRepository,
    @inject('JwtService') private jwtService: JwtService,
    @inject('RedisService') private redisService: RedisService,
  ) {}

  async execute(dto: VerifyOtpVendorDTO): Promise<AuthResponseDTO> {
    console.log('🚀 ~ VerifyOtpVendorUseCase ~ execute ~ dto:', dto);

    const storedOtp = await this.redisService.get(`otp:${dto.email}`);
    console.log('storedOtp:', storedOtp);
    if (!storedOtp) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION.INVALID_OTP, HttpResCode.BAD_REQUEST);
    }

    const existingTheater = await this.vendorRepository.findByEmail(dto.email);
    if (existingTheater) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION.USER_ALREADY_EXISTS, HttpResCode.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    const theater = new Vendor(
      null as any,
      null,
      dto.name,
      'pending',
      null,
      null,
      new Date(),
      new Date(),
      15,
      [],
      dto.email,
      dto.phone,
      hashedPassword,
      0,
      dto.accountType,
    );
    console.log('sadas');

    try {
      const created = await this.vendorRepository.create(theater);
      console.log('🚀 ~ VerifyOtpVendorUseCase ~ execute ~ created:', created);
    } catch (error) {
      console.log('🚀 ~ VerifyOtpVendorUseCase ~ execute ~ error:', error);
    }

    const createdTheater = await this.vendorRepository.findByEmail(dto.email);
    if (!createdTheater) {
      throw new CustomError(
        ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }

    // Generate JWT tokens
    const accessToken = this.jwtService.generateAccessToken(
      createdTheater._id.toString(),
      createdTheater.accountType,
    );
    const refreshToken = this.jwtService.generateRefreshToken(
      createdTheater._id.toString(),
      createdTheater.accountType,
    );
    await this.redisService.del(`otp:${dto.email}`);

    return new AuthResponseDTO(accessToken, refreshToken, {
      id: createdTheater._id.toString(),
      email: createdTheater.email!,
      name: createdTheater.name,
      phone: createdTheater.phone || 0,
      profileImage: createdTheater.gallery?.[0] || '',
      role: createdTheater.accountType,
    });
  }
}
