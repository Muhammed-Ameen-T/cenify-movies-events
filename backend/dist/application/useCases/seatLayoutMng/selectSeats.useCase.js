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
exports.SelectSeatsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const mongoose_1 = __importDefault(require("mongoose"));
const showAgenda_service_1 = require("../../../infrastructure/services/showAgenda.service");
const socket_service_1 = require("../../../infrastructure/services/socket.service");
let SelectSeatsUseCase = class SelectSeatsUseCase {
    constructor(showRepository, seatLayoutRepository, screenRepository, seatRepository, showJobService) {
        this.showRepository = showRepository;
        this.seatLayoutRepository = seatLayoutRepository;
        this.screenRepository = screenRepository;
        this.seatRepository = seatRepository;
        this.showJobService = showJobService;
        console.log(`SelectSeatsUseCase initialized with SocketService instance ID: ${socket_service_1.socketService.getInstanceId()}`);
    }
    async execute(dto) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const { showId, seatIds, userId } = dto;
            if (!mongoose_1.default.Types.ObjectId.isValid(showId)) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            if (!Array.isArray(seatIds) || seatIds.length === 0) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.INVALID_SEAT_SELECTION, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            if (!userId) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            console.log(`Selecting seats for showId: ${showId}, seatIds:`, seatIds);
            const show = await this.showRepository.findByIdSession(showId, session);
            if (!show) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const screen = await this.screenRepository.findByIdSession(show.screenId, session);
            if (!screen) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SCREEN_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            if (!screen.seatLayoutId) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SEAT_LAYOUT_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const seats = await this.seatRepository.findSeatsByIdsSession(screen.seatLayoutId._id.toString(), seatIds, session);
            const bookedSeats = show.bookedSeats || [];
            const invalidSeats = seats.filter((seat) => {
                const booked = bookedSeats.find((bs) => bs.seatNumber === seat.number);
                return booked || seat.type === 'Unavailable';
            });
            if (invalidSeats.length > 0) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.SEATS_ALREADY_FILLED, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const newBookedSeats = seats.map((seat) => ({
                date: new Date(),
                isPending: true,
                seatNumber: String(seat.number),
                seatPrice: Number(seat.price),
                type: String(seat.type),
                position: {
                    row: seat.position?.row ?? 0,
                    col: seat.position?.col ?? 0,
                },
                userId: String(userId),
            }));
            await this.showRepository.updateBookedSeatsSession(showId, newBookedSeats, session);
            await session.commitTransaction();
            const validSeatIds = seats
                .map((seat) => (seat._id ? seat._id.toString() : null))
                .filter((id) => id !== null);
            if (validSeatIds.length > 0) {
                console.log(`Emitting seatUpdate for showId: ${showId}, seatIds:`, validSeatIds, `SocketService instance ID: ${socket_service_1.socketService.getInstanceId()}`);
                socket_service_1.socketService.emitSeatUpdate(showId, validSeatIds, 'pending');
            }
            else {
                console.warn('No valid seat IDs to emit for socket update');
            }
            await this.showJobService.scheduleSeatExpiration(showId);
            return {
                selectedSeats: seats.map((seat) => ({
                    seatId: seat._id.toString(),
                    seatNumber: seat.number,
                    price: seat.price,
                    type: seat.type,
                })),
            };
        }
        catch (error) {
            await session.abortTransaction();
            console.error('❌ Error selecting seats:', error);
            throw new custom_error_1.CustomError(error instanceof custom_error_1.CustomError
                ? error.message
                : commonErrorMsg_constants_1.default.GENERAL.FAILED_SELECTING_SEATS, error instanceof custom_error_1.CustomError ? error.statusCode : httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        finally {
            session.endSession();
        }
    }
};
exports.SelectSeatsUseCase = SelectSeatsUseCase;
exports.SelectSeatsUseCase = SelectSeatsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ShowRepository')),
    __param(1, (0, tsyringe_1.inject)('SeatLayoutRepository')),
    __param(2, (0, tsyringe_1.inject)('ScreenRepository')),
    __param(3, (0, tsyringe_1.inject)('SeatRepository')),
    __param(4, (0, tsyringe_1.inject)('ShowJobService')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, showAgenda_service_1.ShowJobService])
], SelectSeatsUseCase);
