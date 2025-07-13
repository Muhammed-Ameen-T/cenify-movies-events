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
exports.ChangePasswordUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const user_dto_1 = require("../../dtos/user.dto");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const hash_utils_1 = require("../../../utils/helpers/hash.utils");
let ChangePasswordUseCase = class ChangePasswordUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(dto) {
        // Fetch existing user
        const existingUser = await this.userRepository.findById(dto.userId);
        if (!existingUser) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
        }
        // Verify old password
        if (!existingUser.password) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.PASSWORD_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        const isPasswordValid = await bcryptjs_1.default.compare(dto.oldPassword, existingUser.password);
        if (!isPasswordValid) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.OLD_PASSWORD_INVALID, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        // Hash new password
        const hashedNewPassword = await (0, hash_utils_1.hashPassword)(dto.newPassword);
        const updatedUser = await this.userRepository.updatePasswordById(dto.userId, hashedNewPassword);
        // Return UserResponseDTO
        return new user_dto_1.UserResponseDTO(updatedUser._id.toString(), updatedUser.name, updatedUser.email, updatedUser.phone, updatedUser.role, updatedUser.isBlocked, updatedUser.createdAt.toISOString(), updatedUser.updatedAt.toISOString(), updatedUser.profileImage);
    }
};
exports.ChangePasswordUseCase = ChangePasswordUseCase;
exports.ChangePasswordUseCase = ChangePasswordUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object])
], ChangePasswordUseCase);
