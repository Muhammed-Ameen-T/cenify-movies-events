import { injectable, inject } from 'tsyringe';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { JwtService } from '../../../infrastructure/services/jwt.service';
import { GoogleAuthRequestDTO, AuthResponseDTO } from '../../dtos/auth.dto';

/**
 * Use case for handling Google authentication and user creation/updating.
 */
@injectable()
export class GoogleAuthUseCase {
  private googleClient: OAuth2Client;

  /**
   * Initializes the GoogleAuthUseCase with dependency injection for user repository and JWT service.
   * @param {IUserRepository} userRepository - Repository for user management.
   * @param {JwtService} jwtService - Service for JWT handling.
   */
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('JwtService') private jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * Executes the Google authentication flow.
   * Verifies the provided ID token, checks user existence, and issues new tokens.
   *
   * @param {GoogleAuthRequestDTO} request - DTO containing the Google ID token.
   * @returns {Promise<AuthResponseDTO>} Auth response including access/refresh tokens and user details.
   * @throws {Error} If the Google token is invalid or user creation fails.
   */
  async execute(request: GoogleAuthRequestDTO): Promise<AuthResponseDTO> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: request.idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google token');

    const { sub: authId, email, name, picture } = payload;
    let user =
      (await this.userRepository.findByAuthId(authId)) ||
      (email ? await this.userRepository.findByEmail(email) : null);

    if (!user) {
      user = new User(
        null as any,
        name || 'User',
        email!,
        null,
        authId,
        null,
        picture || null,
        null,
        { buyDate: null, expiryDate: null, isPass: null },
        0,
        false,
        false,
        new Date(),
        new Date(),
      );
      user = await this.userRepository.create(user);
    } else if (!user.authId || !user.profileImage) {
      user.authId = authId;
      user.profileImage = picture || user.profileImage;
      user = await this.userRepository.update(user);
    }

    const accessToken = this.jwtService.generateAccessToken(
      user._id ? user._id.toString() : '',
      'user',
    );
    const refreshToken = this.jwtService.generateRefreshToken(
      user._id ? user._id.toString() : '',
      'user',
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id ? user._id.toString() : '',
        name: user.name,
        email: user.email,
        phone: 9876543210,
        profileImage: user.profileImage,
        role: user.isAdmin ? 'admin' : 'user',
      },
    };
  }

  /**
   * Handles refresh token logic.
   * Verifies the provided refresh token and generates a new access token.
   *
   * @param {string} refreshToken - The refresh token for session renewal.
   * @returns {Promise<{ accessToken: string }>} Newly generated access token.
   * @throws {Error} If the refresh token is invalid or user is not found.
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const decoded = this.jwtService.verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findById(decoded.userId);
    if (!user) throw new Error('User not found');

    const accessToken = this.jwtService.generateAccessToken(
      user._id ? user._id.toString() : '',
      'user',
    );
    return { accessToken };
  }
}
