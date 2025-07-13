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
exports.UpdateUserBlockStatusUseCase = void 0;
// src/useCases/Admin/updateUserBlockStatus.useCase.ts
const tsyringe_1 = require("tsyringe");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const sendResponse_utils_1 = require("../../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const custom_error_1 = require("../../../utils/errors/custom.error");
let UpdateUserBlockStatusUseCase = class UpdateUserBlockStatusUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(id, data, res) {
        try {
            // Validate isBlocked
            // if (typeof data.isBlocked !== 'boolean') {
            //   throw new CustomError(
            //     ERROR_MESSAGES.VALIDATION.INVALID_STATUS,
            //     HttpResCode.BAD_REQUEST,
            //   );
            // }
            // Check if user exists
            const user = await this.userRepository.findById(id);
            if (!user) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
            }
            // Update block status
            await this.userRepository.updateBlockStatus(id, data.isBlocked);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, {
                message: `User ${data.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            });
        }
        catch (error) {
            console.error('UpdateUserBlockStatusUseCase error:', error);
            if (error instanceof custom_error_1.CustomError) {
                (0, sendResponse_utils_1.sendResponse)(res, error.statusCode, error.message);
            }
            else {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR, commonErrorMsg_constants_1.default.GENERAL.FAILED_UPDATING_BLOCK_STATUS);
            }
        }
    }
};
exports.UpdateUserBlockStatusUseCase = UpdateUserBlockStatusUseCase;
exports.UpdateUserBlockStatusUseCase = UpdateUserBlockStatusUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object])
], UpdateUserBlockStatusUseCase);
