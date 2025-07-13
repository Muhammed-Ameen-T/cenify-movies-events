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
exports.MoviePassController = void 0;
const tsyringe_1 = require("tsyringe");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const custom_error_1 = require("../../utils/errors/custom.error");
const stripe_1 = __importDefault(require("stripe"));
const env_config_1 = require("../../config/env.config");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
let MoviePassController = class MoviePassController {
    constructor(createMoviePassUseCase, fetchMoviePassUseCase, findMoviePassHistoryUseCase) {
        this.createMoviePassUseCase = createMoviePassUseCase;
        this.fetchMoviePassUseCase = fetchMoviePassUseCase;
        this.findMoviePassHistoryUseCase = findMoviePassHistoryUseCase;
        this.stripe = new stripe_1.default(env_config_1.env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
    }
    async createCheckoutSession(req, res, next) {
        const userId = req.decoded?.userId;
        if (!userId) {
            throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: 'Movie Pass',
                                description: '30-day Movie Pass subscription',
                            },
                            unit_amount: 19900, // ₹199 in paise
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `http://localhost:5173/account/moviepass-tab?payment=success`,
                cancel_url: `http://localhost:5173/account/moviepass-tab?payment=canceled`,
                metadata: { userId },
            });
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, { sessionId: session.id });
        }
        catch (error) {
            next(error);
        }
    }
    async createMoviePass(req, res, next) {
        const userId = req.body.userId;
        if (!userId) {
            throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        try {
            const purchaseDate = new Date();
            const expireDate = new Date(purchaseDate);
            expireDate.setDate(purchaseDate.getDate() + 30);
            const moviePass = await this.createMoviePassUseCase.execute({
                userId,
                purchaseDate,
                expireDate,
            });
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.CREATED, httpResponseCode_utils_1.HttpResMsg.SUCCESS, moviePass);
        }
        catch (error) {
            next(error);
        }
    }
    async getMoviePass(req, res, next) {
        const userId = req.decoded?.userId;
        if (!userId) {
            throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        try {
            const moviePass = await this.fetchMoviePassUseCase.execute(userId);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, moviePass || {});
        }
        catch (error) {
            next(error);
        }
    }
    async findMoviePassHistory(req, res, next) {
        const userId = req.decoded?.userId;
        if (!userId) {
            throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        const { page = '1', limit = '5' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_PAGINATION_PARAMS, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        try {
            const result = await this.findMoviePassHistoryUseCase.execute(userId, pageNum, limitNum);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.MoviePassController = MoviePassController;
exports.MoviePassController = MoviePassController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('CreateMoviePassUseCase')),
    __param(1, (0, tsyringe_1.inject)('FetchMoviePassUseCase')),
    __param(2, (0, tsyringe_1.inject)('FindMoviePassHistoryUseCase')),
    __metadata("design:paramtypes", [Object, Object, Object])
], MoviePassController);
