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
exports.ProcessVendorPayoutUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const booking_model_1 = __importDefault(require("../../../infrastructure/database/booking.model"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let ProcessVendorPayoutUseCase = class ProcessVendorPayoutUseCase {
    constructor(showRepository, walletRepository) {
        this.showRepository = showRepository;
        this.walletRepository = walletRepository;
        this.ADMIN_COMMISSION = 0.15;
    }
    async execute() {
        const bookings = await booking_model_1.default.aggregate([
            {
                $match: {
                    status: 'confirmed',
                    'payment.status': 'completed',
                },
            },
            {
                $lookup: {
                    from: 'shows',
                    localField: 'showId',
                    foreignField: '_id',
                    as: 'showDetails',
                },
            },
            { $unwind: '$showDetails' },
            {
                $match: {
                    'showDetails.status': { $in: ['Running', 'Completed'] },
                },
            },
            {
                $group: {
                    _id: '$showDetails.vendorId',
                    totalRevenue: { $sum: '$payment.amount' },
                },
            },
        ]);
        const result = [];
        for (const vendor of bookings) {
            const vendorId = vendor._id.toString();
            const gross = vendor.totalRevenue;
            const net = gross * (1 - this.ADMIN_COMMISSION);
            await this.walletRepository.pushTransactionAndUpdateBalance(vendor._id, {
                amount: net,
                type: 'credit',
                source: 'booking',
                remark: `Monthly payout after ${this.ADMIN_COMMISSION * 100}% commission`,
                createdAt: new Date(),
            });
            const targetUserId = process.env.ADMIN_USER_ID || '681a66250869b998bbad2545';
            await this.walletRepository.pushTransactionAndUpdateBalance(targetUserId, {
                amount: net,
                type: 'debit',
                source: 'booking',
                remark: `Monthly payout transferred to vendor ${vendor._id}, credited ₹${net}`,
                createdAt: new Date(),
            });
            result.push({ vendorId, gross, net });
        }
        return result;
    }
};
exports.ProcessVendorPayoutUseCase = ProcessVendorPayoutUseCase;
exports.ProcessVendorPayoutUseCase = ProcessVendorPayoutUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ShowRepository')),
    __param(1, (0, tsyringe_1.inject)('WalletRepository')),
    __metadata("design:paramtypes", [Object, Object])
], ProcessVendorPayoutUseCase);
