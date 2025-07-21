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
exports.FindUserWalletTransactionsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const wallet_entity_1 = require("../../../domain/entities/wallet.entity");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
let FindUserWalletTransactionsUseCase = class FindUserWalletTransactionsUseCase {
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
    }
    async execute(userId, page, limit, filter = 'all') {
        try {
            const result = await this.walletRepository.findTransactionsByUserId(userId, page, limit, filter);
            const transactions = result?.transactions.map((t) => new wallet_entity_1.Transaction(t.id, t.amount, t.type, t.source, t.createdAt, t.status, t.remark));
            return {
                transactions,
                total: result.total,
                creditCount: result.creditCount,
                debitCount: result.debitCount,
                totalCredit: result.totalCredit,
                totalDebit: result.totalDebit,
            };
        }
        catch (error) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
        }
    }
};
exports.FindUserWalletTransactionsUseCase = FindUserWalletTransactionsUseCase;
exports.FindUserWalletTransactionsUseCase = FindUserWalletTransactionsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('WalletRepository')),
    __metadata("design:paramtypes", [Object])
], FindUserWalletTransactionsUseCase);
