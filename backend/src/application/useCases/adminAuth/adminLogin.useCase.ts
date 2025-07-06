import { inject, injectable } from 'tsyringe';
import { ILoginUserUseCase } from '../../../domain/interfaces/useCases/User/loginUser.interface';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { LoginDTO, AuthResponseDTO } from '../../dtos/auth.dto';
import { JwtService } from '../../../infrastructure/services/jwt.service';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import bcrypt from 'bcryptjs';

/**
 * Use case for handling admin login.
 * Validates admin credentials and generates authentication tokens.
 */
@injectable()
export class LoginAdminUseCase implements ILoginUserUseCase {
  /**
   * Initializes the LoginAdminUseCase with injected dependencies.
   *
   * @param {IUserRepository} userRepository - Repository for user data retrieval.
   * @param {JwtService} jwtService - Service for JWT token generation.
   */
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('JwtService') private jwtService: JwtService,
  ) {}

  /**
   * Executes the admin login process.
   * Validates admin credentials, checks blocking status, and generates authentication tokens.
   *
   * @param {LoginDTO} dto - Data Transfer Object containing email and password.
   * @returns {Promise<AuthResponseDTO>} Returns access and refresh tokens along with admin details.
   * @throws {CustomError} If the admin is not found, blocked, or password mismatch occurs.
   */
  async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    const admin = await this.userRepository.findByEmail(dto.email);
    if (!admin) {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND, HttpResCode.UNAUTHORIZED);
    }

    if (admin.role !== 'admin') {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.YOUR_NOT_ADMIN, HttpResCode.FORBIDDEN);
    }

    if (admin.isBlocked) {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.BLOCKED_USER, HttpResCode.UNAUTHORIZED);
    }

    console.log(dto.password, admin.password);
    const isMatch = await bcrypt.compare(dto.password, admin.password!);
    if (!isMatch) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION.PASSWORD_MISMATCH, HttpResCode.UNAUTHORIZED);
    }

    console.log('Admin authenticated successfully');

    const accessToken = this.jwtService.generateAccessToken(admin._id.toString(), 'admin');
    const refreshToken = this.jwtService.generateRefreshToken(admin._id.toString(), 'admin');

    return new AuthResponseDTO(accessToken, refreshToken, {
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      phone: admin.phone || 0,
      profileImage: admin.profileImage,
      role: admin.role,
    });
  }
}
