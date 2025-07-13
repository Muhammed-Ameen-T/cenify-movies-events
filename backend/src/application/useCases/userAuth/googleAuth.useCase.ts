// src/application/use-cases/auth/google-auth.use-case.ts
import { injectable, inject } from 'tsyringe';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { IWalletRepository } from '../../../domain/interfaces/repositories/wallet.repository';
import { JwtService } from '../../../infrastructure/services/jwt.service';
import { CloudinaryService } from '../../../infrastructure/services/cloudinary.service';
import { GoogleAuthRequestDTO, AuthResponseDTO } from '../../dtos/auth.dto';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode, HttpResMsg } from '../../../utils/constants/httpResponseCode.utils';
import { Wallet } from '../../../domain/entities/wallet.entity';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import axios from 'axios';

/**
 * @injectable
 * @description Use case for handling Google authentication.
 */
@injectable()
export class GoogleAuthUseCase {
  private googleClient: OAuth2Client;

  /**
   * @constructor
   * @param {IUserRepository} userRepository - The user repository dependency.
   * @param {IWalletRepository} walletRepository - The wallet repository dependency.
   * @param {JwtService} jwtService - The JWT service dependency.
   * @param {CloudinaryService} cloudinaryService - The Cloudinary service dependency.
   */
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('WalletRepository') private walletRepository: IWalletRepository,
    @inject('JwtService') private jwtService: JwtService,
    @inject('CloudinaryService') private cloudinaryService: CloudinaryService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * @method execute
   * @description Executes the Google authentication process.
   * Verifies the Google ID token, finds or creates a user, uploads their profile image if necessary,
   * creates a wallet for new users, and generates JWT tokens.
   * @param {GoogleAuthRequestDTO} request - The request DTO containing the Google ID token.
   * @returns {Promise<AuthResponseDTO>} A promise that resolves to the authentication response DTO.
   * @throws {CustomError} If the Google token is invalid, user is not found after creation, or user is blocked.
   */
  async execute(request: GoogleAuthRequestDTO): Promise<AuthResponseDTO> {
    // Verify Google ID token
    const ticket = await this.googleClient.verifyIdToken({
      idToken: request.idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new CustomError('Invalid Google token', HttpResCode.UNAUTHORIZED);

    const { sub: authId, email, name, picture } = payload;
    let user =
      (await this.userRepository.findByAuthId(authId)) ||
      (email ? await this.userRepository.findByEmail(email.toLowerCase()) : null);

    let profileImage = picture || null;

    // Fetch and upload profile image to Cloudinary
    if (picture && !user?.profileImage) {
      try {
        const response = await axios.get(picture, { responseType: 'arraybuffer' });
        const fileBuffer = Buffer.from(response.data);
        profileImage = await this.cloudinaryService.uploadImage(
          fileBuffer,
          `google-profile-${authId}-${Date.now()}`,
        );
      } catch (error) {
        console.warn('Failed to upload Google profile image to Cloudinary:', error);
        profileImage = picture; // Fallback to Google picture URL
      }
    }

    if (!user) {
      // Create new user
      user = new User(
        null as any,
        name || 'User',
        email!.toLowerCase(),
        null,
        authId,
        null,
        profileImage,
        null,
        { buyDate: null, expiryDate: null, isPass: null },
        0,
        false,
        'user',
        new Date(),
        new Date(),
      );
      user = await this.userRepository.create(user);
      user = await this.userRepository.findByEmail(user.email.toLowerCase());
      if (!user) {
        throw new CustomError(
          ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND,
          HttpResCode.INTERNAL_SERVER_ERROR,
        );
      }

      // Create wallet for new user
      const newWallet = new Wallet(
        null as any,
        user._id?.toString(),
        0,
        [],
        new Date(),
        new Date(),
      );
      await this.walletRepository.createWallet(newWallet);
    } else if (!user.authId || !user.profileImage) {
      // Update existing user with authId and profileImage
      user.authId = authId;
      user.profileImage = profileImage;
      user = await this.userRepository.update(user);
    }

    if (user?.isBlocked) {
      throw new CustomError(HttpResMsg.USER_BLOCKED, HttpResCode.FORBIDDEN);
    }

    // Generate tokens
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
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        profileImage: user.profileImage,
        role: user.role,
      },
    };
  }
}
// /**
//  * Handles refresh token logic.
//  * Verifies the provided refresh token and generates a new access token.
//  *
//  * @param {string} refreshToken - The refresh token for session renewal.
//  * @returns {Promise<{ accessToken: string }>} Newly generated access token.
//  * @throws {Error} If the refresh token is invalid or user is not found.
//  */
// async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
//   const decoded = this.jwtService.verifyRefreshToken(refreshToken);
//   const user = await this.userRepository.findById(decoded.userId);
//   if (!user) throw new Error('User not found');

//   const accessToken = this.jwtService.generateAccessToken(
//     user._id ? user._id.toString() : '',
//     'user',
//   );
//   return { accessToken };
// }
