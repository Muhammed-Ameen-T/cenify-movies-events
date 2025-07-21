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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementController = void 0;
// src/infrastructure/controllers/userMng.controller.ts
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const custom_error_1 = require("../../utils/errors/custom.error");
let UserManagementController = class UserManagementController {
    constructor(fetchUsersUseCase, updateUserBlockStatusUseCase) {
        this.fetchUsersUseCase = fetchUsersUseCase;
        this.updateUserBlockStatusUseCase = updateUserBlockStatusUseCase;
    }
    async getUsers(req, res, next) {
        try {
            const { page = '1', limit = '5', isBlocked, role, search, sortBy, sortOrder, } = req.query;
            const isBlockedBool = isBlocked !== undefined ? isBlocked === 'true' : undefined;
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            if (isNaN(pageNum) || isNaN(limitNum)) {
                throw new custom_error_1.CustomError('Invalid pagination parameters', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const result = await this.fetchUsersUseCase.execute({
                page: pageNum,
                limit: limitNum,
                isBlocked: isBlockedBool,
                role,
                search,
                sortBy,
                sortOrder,
            });
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, {
                data: {
                    data: result.users,
                    totalCount: result.totalCount,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    hasNextPage: result.hasNextPage,
                    hasPrevPage: result.hasPrevPage,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateUserBlockStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { isBlocked } = req.body;
            if (id === undefined || isBlocked === undefined) {
                throw new custom_error_1.CustomError('Missing required fields', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            await this.updateUserBlockStatusUseCase.execute(id, { isBlocked }, res);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.UserManagementController = UserManagementController;
exports.UserManagementController = UserManagementController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('FetchUsersUseCase')),
    __param(1, (0, tsyringe_1.inject)('UpdateUserBlockStatusUseCase')),
    __metadata("design:paramtypes", [Object, Object])
], UserManagementController);
