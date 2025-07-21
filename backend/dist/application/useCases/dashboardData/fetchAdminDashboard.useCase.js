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
exports.FetchAdminDashboardUseCase = void 0;
// src/application/useCases/adminDashboard/fetchAdminDashboard.useCase.ts
const tsyringe_1 = require("tsyringe");
const adminDashboard_entity_1 = require("../../../domain/entities/adminDashboard.entity");
let FetchAdminDashboardUseCase = class FetchAdminDashboardUseCase {
    constructor(dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }
    async execute(adminId, params) {
        const data = await this.dashboardRepository.getDashboardData(adminId, params);
        return adminDashboard_entity_1.AdminDashboardData.fromMongo(data);
    }
};
exports.FetchAdminDashboardUseCase = FetchAdminDashboardUseCase;
exports.FetchAdminDashboardUseCase = FetchAdminDashboardUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('AdminDashboardRepository')),
    __metadata("design:paramtypes", [Object])
], FetchAdminDashboardUseCase);
