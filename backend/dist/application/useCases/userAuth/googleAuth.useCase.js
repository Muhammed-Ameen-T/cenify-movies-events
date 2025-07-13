"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthUseCase = void 0;
// src/application/use-cases/auth/google-auth.use-case.ts
const tsyringe_1 = require("tsyringe");
const google_auth_library_1 = require("google-auth-library");
const user_entity_1 = require("../../../domain/entities/user.entity");
const jwt_service_1 = require("../../../infrastructure/services/jwt.service");
const cloudinary_service_1 = require("../../../infrastructure/services/cloudinary.service");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const wallet_entity_1 = require("../../../domain/entities/wallet.entity");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const axios_1 = __importDefault(require("axios"));
/**
 * @injectable
 * @description Use case for handling Google authentication.
 */
let GoogleAuthUseCase = class GoogleAuthUseCase {
    /**
     * @constructor
     * @param {IUserRepository} userRepository - The user repository dependency.
     * @param {IWalletRepository} walletRepository - The wallet repository dependency.
     * @param {JwtService} jwtService - The JWT service dependency.
     * @param {CloudinaryService} cloudinaryService - The Cloudinary service dependency.
     */
    constructor(userRepository, walletRepository, jwtService, cloudinaryService) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.jwtService = jwtService;
        this.cloudinaryService = cloudinaryService;
        this.googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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
    async execute(request) {
        // Verify Google ID token
        const ticket = await this.googleClient.verifyIdToken({
            idToken: request.idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload)
            throw new custom_error_1.CustomError('Invalid Google token', httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        const { sub: authId, email, name, picture } = payload;
        let user = (await this.userRepository.findByAuthId(authId)) ||
            (email ? await this.userRepository.findByEmail(email.toLowerCase()) : null);
        let profileImage = picture || null;
        // Fetch and upload profile image to Cloudinary
        if (picture && !user?.profileImage) {
            try {
                const response = await axios_1.default.get(picture, { responseType: 'arraybuffer' });
                const fileBuffer = Buffer.from(response.data);
                profileImage = await this.cloudinaryService.uploadImage(fileBuffer, `google-profile-${authId}-${Date.now()}`);
            }
            catch (error) {
                console.warn('Failed to upload Google profile image to Cloudinary:', error);
                profileImage = picture; // Fallback to Google picture URL
            }
        }
        if (!user) {
            // Create new user
            user = new user_entity_1.User(null, name || 'User', email.toLowerCase(), null, authId, null, profileImage, null, { buyDate: null, expiryDate: null, isPass: null }, 0, false, 'user', new Date(), new Date());
            user = await this.userRepository.create(user);
            user = await this.userRepository.findByEmail(user.email.toLowerCase());
            if (!user) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
            }
            // Create wallet for new user
            const newWallet = new wallet_entity_1.Wallet(null, user._id?.toString(), 0, [], new Date(), new Date());
            await this.walletRepository.createWallet(newWallet);
        }
        else if (!user.authId || !user.profileImage) {
            // Update existing user with authId and profileImage
            user.authId = authId;
            user.profileImage = profileImage;
            user = await this.userRepository.update(user);
        }
        if (user?.isBlocked) {
            throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.USER_BLOCKED, httpResponseCode_utils_1.HttpResCode.FORBIDDEN);
        }
        // Generate tokens
        const accessToken = this.jwtService.generateAccessToken(user._id ? user._id.toString() : '', 'user');
        const refreshToken = this.jwtService.generateRefreshToken(user._id ? user._id.toString() : '', 'user');
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
};
exports.GoogleAuthUseCase = GoogleAuthUseCase;
exports.GoogleAuthUseCase = GoogleAuthUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __param(1, (0, tsyringe_1.inject)('WalletRepository')),
    __param(2, (0, tsyringe_1.inject)('JwtService')),
    __param(3, (0, tsyringe_1.inject)('CloudinaryService')),
    __metadata("design:paramtypes", [Object, Object, jwt_service_1.JwtService,
        cloudinary_service_1.CloudinaryService])
], GoogleAuthUseCase);
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
