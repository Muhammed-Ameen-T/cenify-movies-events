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
exports.PaymentService = void 0;
const tsyringe_1 = require("tsyringe");
const stripe_1 = __importDefault(require("stripe"));
const env_config_1 = require("../../config/env.config");
const custom_error_1 = require("../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
let PaymentService = class PaymentService {
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
        this.stripe = new stripe_1.default(env_config_1.env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
    }
    async checkWalletBalance(userId, amount) {
        const wallet = await this.walletRepository.findByUserId(userId);
        if (!wallet) {
            return false;
        }
        return (wallet.balance || 0) >= amount;
    }
    async deductWalletBalance(userId, amount) {
        const wallet = await this.walletRepository.findByUserId(userId);
        if (!wallet) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.WALLET_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        if ((wallet.balance || 0) < amount) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.INSUFFICIENT_BALANCE, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        await this.walletRepository.pushTransactionAndUpdateBalance(userId, {
            amount: amount,
            remark: 'Booking Payment Debited from Wallet',
            type: 'debit',
            source: 'booking',
            createdAt: new Date(),
        });
    }
    async createStripeSession(userId, bookingId, amount, showId, seats) {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: 'Movie Ticket Booking',
                            metadata: { bookingId, showId },
                        },
                        unit_amount: amount * 100, // Stripe expects amount in paisa
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${env_config_1.env.VITE_API_URL}/booking-success/${bookingId}`,
            cancel_url: `${env_config_1.env.VITE_API_URL}/checkout/${showId}`,
            metadata: {
                userId,
                bookingId,
                showId,
                bookedSeats: JSON.stringify(seats),
            },
        });
        if (!session.url) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.FAILED_TO_CREATE_STRIPE_SESSION, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return session.url;
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('WalletRepository')),
    __metadata("design:paramtypes", [Object])
], PaymentService);
