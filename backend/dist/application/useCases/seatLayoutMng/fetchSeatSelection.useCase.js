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
exports.FetchSeatSelectionUseCase = void 0;
// src/application/useCases/User/fetchSeatSelection.useCase.ts
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
let FetchSeatSelectionUseCase = class FetchSeatSelectionUseCase {
    constructor(showRepository, seatLayoutRepository, screenRepository, seatRepository) {
        this.showRepository = showRepository;
        this.seatLayoutRepository = seatLayoutRepository;
        this.screenRepository = screenRepository;
        this.seatRepository = seatRepository;
    }
    async execute(showId) {
        try {
            // Fetch show details
            const show = await this.showRepository.findById(showId);
            if (!show) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            // Fetch seat layout
            const screen = await this.screenRepository.findById(show.screenId);
            if (!screen) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SCREEN_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            if (!screen.seatLayoutId) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SEAT_LAYOUT_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const seatLayout = await this.seatLayoutRepository.findById(screen.seatLayoutId._id.toString());
            if (!seatLayout) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SEAT_LAYOUT_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            // Fetch seats
            const seats = await this.seatRepository.findSeatsByLayoutId(seatLayout._id?.toString() || '');
            const bookedSeats = show.bookedSeats || [];
            // Map seats to DTO
            const seatDTOs = seats.map((seat) => {
                const bookedSeat = bookedSeats.find((bs) => bs.seatNumber === seat.number);
                return {
                    id: seat._id ? seat._id.toString() : '',
                    number: seat.number,
                    type: seat.type,
                    price: seat.price,
                    status: bookedSeat
                        ? bookedSeat.isPending
                            ? 'pending'
                            : 'booked'
                        : seat.type === 'Unavailable'
                            ? 'unavailable'
                            : 'available',
                    position: seat.position,
                };
            });
            return {
                seats: seatDTOs,
                seatLayout: {
                    rowCount: seatLayout.rowCount,
                    columnCount: seatLayout.columnCount,
                    capacity: seatLayout.capacity,
                    seatPrices: seatLayout.seatPrice,
                },
                showDetails: {
                    showId: show._id,
                    movieTitle: show.movieId?.name || 'Unknown Movie',
                    movieId: show.movieId._id,
                    theaterName: show.theaterId?.name || 'Unknown Theater',
                    theaterCity: show.theaterId?.location.city || 'Unknown City',
                    screenName: show.screenId?.name || 'Unknown Screen',
                    date: show.showDate ? show.showDate.toISOString().split('T')[0] : '',
                    time: show.startTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    }),
                },
            };
        }
        catch (error) {
            console.error('❌ Error fetching seat selection:', error);
            throw new custom_error_1.CustomError(error instanceof custom_error_1.CustomError ? error.message : commonErrorMsg_constants_1.default.GENERAL.FAILED_FINDING_SEATS, error instanceof custom_error_1.CustomError ? error.statusCode : httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.FetchSeatSelectionUseCase = FetchSeatSelectionUseCase;
exports.FetchSeatSelectionUseCase = FetchSeatSelectionUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ShowRepository')),
    __param(1, (0, tsyringe_1.inject)('SeatLayoutRepository')),
    __param(2, (0, tsyringe_1.inject)('ScreenRepository')),
    __param(3, (0, tsyringe_1.inject)('SeatRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], FetchSeatSelectionUseCase);
