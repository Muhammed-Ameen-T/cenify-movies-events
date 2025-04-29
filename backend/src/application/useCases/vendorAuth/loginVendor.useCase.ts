import { inject, injectable } from 'tsyringe';
import { IVendorRepository } from '../../../domain/interfaces/repositories/vendor.repository';
import { LoginDTO, AuthResponseDTO } from '../../dtos/auth.dto';
import { JwtService } from '../../../infrastructure/services/jwt.service';
import { CustomError } from '../../../utils/errors/custome.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { ILoginVendorUseCase } from '../../../domain/interfaces/useCases/Vendor/loginVendor.interface';
import bcrypt from 'bcrypt';

@injectable()
export class LoginVendorUseCase implements ILoginVendorUseCase {
  constructor(
    @inject('VendorRepository') private vendorRepository: IVendorRepository,
    @inject('JwtService') private jwtService: JwtService,
  ) {}

  async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    const theater = await this.vendorRepository.findByEmail(dto.email);
    if (!theater) {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND, HttpResCode.UNAUTHORIZED);
    }

    if (theater.status == 'blocked') {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.BLOCKED_USER, HttpResCode.UNAUTHORIZED);
    }

    if (theater.status !== 'verified') {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.APPLICATION_UNDER_PROCESS, HttpResCode.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(dto.password, theater.password!);
    if (!isMatch) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION.PASSWORD_MISMATCH, HttpResCode.UNAUTHORIZED);
    }

    const accessToken = this.jwtService.generateAccessToken(theater._id, theater.accountType);
    const refreshToken = this.jwtService.generateRefreshToken(theater._id, theater.accountType);

    return new AuthResponseDTO(accessToken, refreshToken, {
      id: theater._id,
      email: theater.email,
      name: theater.name,
      phone: theater.phone,
      profileImage: theater.gallery?.[0] ?? '',
      role: theater.accountType,
    });
  }
}
