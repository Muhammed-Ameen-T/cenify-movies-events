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
exports.SeatSelectionController = void 0;
const tsyringe_1 = require("tsyringe");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const custom_error_1 = require("../../utils/errors/custom.error");
const mongoose_1 = __importDefault(require("mongoose"));
let SeatSelectionController = class SeatSelectionController {
    constructor(fetchSeatSelectionUseCase, selectSeatsUseCase) {
        this.fetchSeatSelectionUseCase = fetchSeatSelectionUseCase;
        this.selectSeatsUseCase = selectSeatsUseCase;
    }
    async getSeatSelection(req, res, next) {
        try {
            const { showId } = req.params;
            // const userId = req.decoded?.userId;
            // if (!userId) {
            //   throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
            // }
            if (!mongoose_1.default.Types.ObjectId.isValid(showId)) {
                throw new custom_error_1.CustomError('Invalid show ID', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const result = await this.fetchSeatSelectionUseCase.execute(showId);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
    async selectSeats(req, res, next) {
        try {
            const { showId } = req.params;
            const { seatIds } = req.body;
            const userId = req.decoded?.userId;
            if (!userId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(showId)) {
                throw new custom_error_1.CustomError('Invalid show ID', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            if (!Array.isArray(seatIds) || seatIds.length === 0) {
                throw new custom_error_1.CustomError('Invalid seat selection', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const result = await this.selectSeatsUseCase.execute({ showId, seatIds, userId });
            // this.socketService.emitSeatUpdate(showId, seatIds, 'pending');
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.SeatSelectionController = SeatSelectionController;
exports.SeatSelectionController = SeatSelectionController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('FetchSeatSelectionUseCase')),
    __param(1, (0, tsyringe_1.inject)('SelectSeatsUseCase')),
    __metadata("design:paramtypes", [Object, Object])
], SeatSelectionController);
