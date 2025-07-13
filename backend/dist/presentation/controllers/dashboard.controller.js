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
exports.DashboardController = void 0;
const tsyringe_1 = require("tsyringe");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const custom_error_1 = require("../../utils/errors/custom.error");
let DashboardController = class DashboardController {
    constructor(fetchDashboardUseCase, fetchAdminDashboardUseCase) {
        this.fetchDashboardUseCase = fetchDashboardUseCase;
        this.fetchAdminDashboardUseCase = fetchAdminDashboardUseCase;
    }
    async getDashboardData(req, res, next) {
        try {
            const vendorId = req.decoded?.userId;
            if (!vendorId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            const params = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                status: req.query.status,
                location: req.query.location,
            };
            const result = await this.fetchDashboardUseCase.execute(vendorId, params);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getAdminDashboardData(req, res, next) {
        try {
            const adminId = req.decoded?.userId;
            if (!adminId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            const params = {
                period: req.query.period,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                location: req.query.location,
            };
            const result = await this.fetchAdminDashboardUseCase.execute(adminId, params);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.DashboardController = DashboardController;
exports.DashboardController = DashboardController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('FetchDashboardUseCase')),
    __param(1, (0, tsyringe_1.inject)('FetchAdminDashboardUseCase')),
    __metadata("design:paramtypes", [Object, Object])
], DashboardController);
