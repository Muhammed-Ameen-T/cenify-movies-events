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
exports.ScreenManagementController = void 0;
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const custom_error_1 = require("../../utils/errors/custom.error");
let ScreenManagementController = class ScreenManagementController {
    constructor(createScreenUseCase, updateScreenUseCase, fetchScreensOfVendorUseCase) {
        this.createScreenUseCase = createScreenUseCase;
        this.updateScreenUseCase = updateScreenUseCase;
        this.fetchScreensOfVendorUseCase = fetchScreensOfVendorUseCase;
    }
    async createScreen(req, res, next) {
        try {
            const screen = await this.createScreenUseCase.execute(req.body);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.CREATED, httpResponseCode_utils_1.HttpResMsg.SUCCESS, screen);
        }
        catch (error) {
            next(error);
        }
    }
    async updateScreen(req, res, next) {
        const { id } = req.params;
        try {
            const screen = await this.updateScreenUseCase.execute(id, req.body);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, screen);
        }
        catch (error) {
            next(error);
        }
    }
    async getScreensOfVendor(req, res, next) {
        try {
            const { page, limit, search, theaterId, sortBy, sortOrder } = req.query;
            const vendorId = req.decoded?.userId;
            if (!vendorId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            const params = {
                vendorId,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                search: search ? search : undefined,
                theaterId: theaterId ? theaterId : undefined,
                sortBy: sortBy ? sortBy : undefined,
                sortOrder: sortOrder ? sortOrder : undefined,
            };
            const result = await this.fetchScreensOfVendorUseCase.execute(params);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.ScreenManagementController = ScreenManagementController;
exports.ScreenManagementController = ScreenManagementController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('CreateScreenUseCase')),
    __param(1, (0, tsyringe_1.inject)('UpdateScreenUseCase')),
    __param(2, (0, tsyringe_1.inject)('FetchScreensOfVendorUseCase')),
    __metadata("design:paramtypes", [Object, Object, Object])
], ScreenManagementController);
