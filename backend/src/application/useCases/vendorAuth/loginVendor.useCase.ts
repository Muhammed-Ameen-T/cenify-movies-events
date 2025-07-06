import { inject, injectable } from 'tsyringe';
import { LoginDTO, AuthResponseDTO } from '../../dtos/auth.dto';
import { JwtService } from '../../../infrastructure/services/jwt.service';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { ILoginVendorUseCase } from '../../../domain/interfaces/useCases/Vendor/loginVendor.interface';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import bcrypt from 'bcryptjs';

@injectable()
export class LoginVendorUseCase implements ILoginVendorUseCase {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('JwtService') private jwtService: JwtService,
  ) {}

  async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    const vendor = await this.userRepository.findByEmail(dto.email);

    if (!vendor) {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND, HttpResCode.UNAUTHORIZED);
    }

    if (vendor.isBlocked) {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.BLOCKED_USER, HttpResCode.UNAUTHORIZED);
    }

    if (vendor.role !== 'vendor') {
      throw new CustomError(
        ERROR_MESSAGES.AUTHENTICATION.YOUR_NOT_VENDOR,
        HttpResCode.UNAUTHORIZED,
      );
    }

    const isMatch = await bcrypt.compare(dto.password, vendor.password!);
    if (!isMatch) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION.PASSWORD_MISMATCH, HttpResCode.UNAUTHORIZED);
    }

    const accessToken = this.jwtService.generateAccessToken(vendor._id.toString(), vendor.role);
    const refreshToken = this.jwtService.generateRefreshToken(vendor._id.toString(), vendor.role);

    return new AuthResponseDTO(accessToken, refreshToken, {
      id: vendor._id.toString(),
      email: vendor.email,
      name: vendor.name,
      phone: vendor.phone,
      profileImage: vendor.profileImage,
      role: vendor.role,
    });
  }
}
