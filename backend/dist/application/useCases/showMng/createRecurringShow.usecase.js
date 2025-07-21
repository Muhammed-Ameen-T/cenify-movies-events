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
exports.CreateRecurringShowUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const show_entity_1 = require("../../../domain/entities/show.entity");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const mongoose_1 = __importDefault(require("mongoose"));
let CreateRecurringShowUseCase = class CreateRecurringShowUseCase {
    constructor(showRepository, screenRepository, movieRepository, theaterRepository) {
        this.showRepository = showRepository;
        this.screenRepository = screenRepository;
        this.movieRepository = movieRepository;
        this.theaterRepository = theaterRepository;
    }
    async execute(showId, startDate, endDate, vendorId) {
        try {
            // Validate showId
            if (!mongoose_1.default.Types.ObjectId.isValid(showId)) {
                throw new custom_error_1.CustomError('Invalid show ID', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            // Fetch the original show
            const originalShow = await this.showRepository.findById(showId);
            if (!originalShow) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            // Validate vendor ownership
            if (originalShow.vendorId != vendorId) {
                throw new custom_error_1.CustomError('Unauthorized: Vendor does not own this show', httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            // Validate IDs in originalShow
            const idsToValidate = {
                movieId: originalShow.movieId?._id?.toString(),
                theaterId: originalShow.theaterId?._id?.toString(),
                screenId: originalShow.screenId?._id?.toString(),
                vendorId: originalShow.vendorId?.toString(),
            };
            for (const [key, id] of Object.entries(idsToValidate)) {
                if (!id || typeof id !== 'string' || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new custom_error_1.CustomError(`Invalid ${key} in original show data`, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
                }
            }
            // Validate dates
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_DATE, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            if (start > end) {
                throw new custom_error_1.CustomError('Start date cannot be after end date', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            // Fetch movie duration
            const movie = await this.movieRepository.findById(idsToValidate.movieId);
            if (!movie || !movie.duration) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.MOVIE_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const { hours, minutes, seconds } = movie.duration;
            const movieDurationMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
            // Fetch theater interval gap
            const theater = await this.theaterRepository.findById(idsToValidate.theaterId);
            if (!theater || typeof theater.intervalTime !== 'number') {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.THEATER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const intervalGapMs = theater.intervalTime * 60 * 1000;
            // Generate list of dates
            const dates = [];
            let currentDate = new Date(start);
            while (currentDate <= end) {
                dates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
            const createdShows = [];
            for (const showDate of dates) {
                // Calculate start and end times for the new show on this date
                const startTime = new Date(showDate);
                startTime.setHours(originalShow.startTime.getHours(), originalShow.startTime.getMinutes(), originalShow.startTime.getSeconds(), originalShow.startTime.getMilliseconds());
                const endTime = new Date(startTime.getTime() + movieDurationMs + intervalGapMs);
                // Check for time slot availability
                const isSlotAvailable = await this.screenRepository.checkSlot(idsToValidate.screenId, startTime, endTime);
                if (!isSlotAvailable) {
                    throw new custom_error_1.CustomError(`Time slot conflict detected for show on ${showDate.toISOString().split('T')[0]}`, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
                }
                // Create new show
                const newShow = new show_entity_1.Show(null, startTime, idsToValidate.movieId, // Use string ID
                idsToValidate.theaterId, idsToValidate.screenId, idsToValidate.vendorId, 'Scheduled', [], endTime, showDate);
                const savedShow = await this.showRepository.create(newShow);
                createdShows.push(savedShow);
            }
            return createdShows;
        }
        catch (error) {
            console.error('❌ Error creating recurring shows:', error);
            if (error instanceof custom_error_1.CustomError) {
                throw error;
            }
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_SAVED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CreateRecurringShowUseCase = CreateRecurringShowUseCase;
exports.CreateRecurringShowUseCase = CreateRecurringShowUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ShowRepository')),
    __param(1, (0, tsyringe_1.inject)('ScreenRepository')),
    __param(2, (0, tsyringe_1.inject)('MovieRepository')),
    __param(3, (0, tsyringe_1.inject)('TheaterRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], CreateRecurringShowUseCase);
