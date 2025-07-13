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
exports.StripeWebhookController = void 0;
const tsyringe_1 = require("tsyringe");
const stripe_1 = __importDefault(require("stripe"));
const env_config_1 = require("../../config/env.config");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
let StripeWebhookController = class StripeWebhookController {
    constructor(createMoviePassUseCase) {
        this.createMoviePassUseCase = createMoviePassUseCase;
        this.stripe = new stripe_1.default(env_config_1.env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
    }
    async handleWebhook(req, res, next) {
        const sig = req.headers['stripe-signature'];
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(req.body, sig, env_config_1.env.STRIPE_WEBHOOK_SECRET);
        }
        catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST, 'Webhook Error');
            return;
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.userId;
            if (userId) {
                try {
                    const purchaseDate = new Date();
                    const expireDate = new Date(purchaseDate);
                    expireDate.setDate(purchaseDate.getDate() + 30);
                    await this.createMoviePassUseCase.execute({
                        userId,
                        purchaseDate,
                        expireDate,
                    });
                    console.log(`✅ Movie Pass created for user ${userId}`);
                }
                catch (error) {
                    console.error(`❌ Failed to create Movie Pass for user ${userId}:`, error);
                }
            }
        }
        (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, 'Webhook received');
    }
};
exports.StripeWebhookController = StripeWebhookController;
exports.StripeWebhookController = StripeWebhookController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('CreateMoviePassUseCase')),
    __metadata("design:paramtypes", [Object])
], StripeWebhookController);
