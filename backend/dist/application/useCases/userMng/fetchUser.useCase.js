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
exports.FetchUsersUseCase = void 0;
// src/useCases/Admin/fetchUsers.useCase.ts
const tsyringe_1 = require("tsyringe");
const user_dto_1 = require("../../../application/dtos/user.dto");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
let FetchUsersUseCase = class FetchUsersUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(params) {
        try {
            const { page, limit, isBlocked, role, search, sortBy, sortOrder } = params;
            const roleArray = role ? role.split(',') : undefined;
            const result = await this.userRepository.findUsers({
                page,
                limit,
                isBlocked,
                role: roleArray,
                search,
                sortBy,
                sortOrder,
            });
            return {
                users: result.users.map((user) => this.mapToDTO(user)),
                totalCount: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                hasNextPage: result.hasNextPage,
                hasPrevPage: result.hasPrevPage,
            };
        }
        catch (error) {
            console.error('FetchUsersUseCase error:', error);
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.FAILED_FETCHING_USERS, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    mapToDTO(user) {
        return new user_dto_1.UserResponseDTO(user._id.toString(), user.name, user.email, user.phone, user.role, user.isBlocked, user.createdAt.toISOString(), user.updatedAt.toISOString(), user.profileImage);
    }
};
exports.FetchUsersUseCase = FetchUsersUseCase;
exports.FetchUsersUseCase = FetchUsersUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object])
], FetchUsersUseCase);
