"use strict";
// src/application/usecases/payment/checkPaymentOptions.usecase.ts
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
exports.CheckPaymentOptionsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const checkoutPayment_service_1 = require("../../../infrastructure/services/checkoutPayment.service");
let CheckPaymentOptionsUseCase = class CheckPaymentOptionsUseCase {
    constructor(paymentService, moviePassRepository, walletRepository) {
        this.paymentService = paymentService;
        this.moviePassRepository = moviePassRepository;
        this.walletRepository = walletRepository;
    }
    async execute(userId, totalAmount) {
        const hasSufficientWalletBalance = await this.paymentService.checkWalletBalance(userId, totalAmount);
        const moviePass = await this.moviePassRepository.findByUserId(userId);
        const isMoviePassActive = moviePass?.status === 'Active';
        const wallet = await this.walletRepository.findByUserId(userId);
        return {
            wallet: {
                enabled: hasSufficientWalletBalance,
                balance: wallet?.balance ?? 0,
            },
            stripe: { enabled: true },
            moviePass: { active: isMoviePassActive },
        };
    }
};
exports.CheckPaymentOptionsUseCase = CheckPaymentOptionsUseCase;
exports.CheckPaymentOptionsUseCase = CheckPaymentOptionsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('PaymentService')),
    __param(1, (0, tsyringe_1.inject)('MoviePassRepository')),
    __param(2, (0, tsyringe_1.inject)('WalletRepository')),
    __metadata("design:paramtypes", [checkoutPayment_service_1.PaymentService, Object, Object])
], CheckPaymentOptionsUseCase);
