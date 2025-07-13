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
 * Handles the user login process using dependency injection for authentication and database operations.
 */
@injectable()
export class LoginUserUseCase implements ILoginUserUseCase {
  /**
   * Initializes the LoginUserUseCase with injected dependencies.
   *
   * @param {IUserRepository} userRepository - Repository for user data retrieval.
   * @param {JwtService} jwtService - Service for JWT token generation.
   */
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('JwtService') private jwtService: JwtService,
  ) {}

  /**
   * Executes the login process.
   * Validates user credentials, checks blocking status, and generates authentication tokens.
   *
   * @param {LoginDTO} dto - Data Transfer Object containing email and password.
   * @returns {Promise<AuthResponseDTO>} Returns access and refresh tokens along with user details.
   * @throws {CustomError} If user is not found, blocked, or password mismatch occurs.
   */
  async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND, HttpResCode.UNAUTHORIZED);
    }

    if (user.isBlocked) {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.BLOCKED_USER, HttpResCode.UNAUTHORIZED);
    }

    if (user.role != 'user') {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.YOUR_NOT_USER, HttpResCode.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(dto.password, user.password!);
    if (!isMatch) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION.PASSWORD_MISMATCH, HttpResCode.UNAUTHORIZED);
    }

    const accessToken = this.jwtService.generateAccessToken(user._id.toString(), 'user');
    const refreshToken = this.jwtService.generateRefreshToken(user._id.toString(), 'user');

    return new AuthResponseDTO(accessToken, refreshToken, {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone || 0,
      profileImage: user.profileImage,
      role: user.role,
    });
  }
}
