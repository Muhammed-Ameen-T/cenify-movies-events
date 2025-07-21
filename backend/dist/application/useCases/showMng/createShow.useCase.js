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
exports.CreateShowUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const show_entity_1 = require("../../../domain/entities/show.entity");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const mongoose_1 = __importDefault(require("mongoose"));
let CreateShowUseCase = class CreateShowUseCase {
    constructor(showRepository, screenRepository, movieRepository, theaterRepository) {
        this.showRepository = showRepository;
        this.screenRepository = screenRepository;
        this.movieRepository = movieRepository;
        this.theaterRepository = theaterRepository;
    }
    async execute(vendorId, dto) {
        try {
            // Validate input
            if (!dto.showTimes || !Array.isArray(dto.showTimes) || dto.showTimes.length === 0) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_TIMES_REQUIRED, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            // Fetch Movie Duration
            const movie = await this.movieRepository.findById(dto.movieId);
            if (!movie || !movie.duration) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.MOVIE_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const { hours, minutes, seconds } = movie.duration;
            const movieDurationMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
            // Fetch Theater Interval Gap
            const theater = await this.theaterRepository.findById(dto.theaterId);
            if (!theater || typeof theater.intervalTime !== 'number') {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.THEATER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const intervalGapMs = theater.intervalTime * 60 * 1000;
            if (theater.status != 'verified') {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.THEATER_NOT_VERIFIED, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            // Parse show date
            const showDate = new Date(dto.date);
            if (isNaN(showDate.getTime())) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_DATE, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            // Create shows for each show time
            const createdShows = [];
            for (const showTime of dto.showTimes) {
                const startTime = new Date(showTime.startTime);
                const endTime = new Date(showTime.endTime);
                // Validate startTime and endTime
                if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                    throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_TIME, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
                }
                // Verify endTime matches expected duration
                const expectedEndTime = new Date(startTime.getTime() + movieDurationMs + intervalGapMs);
                if (endTime.getTime() !== expectedEndTime.getTime()) {
                    throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_END_TIME, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
                }
                // Check if time slot is available
                const isSlotAvailable = await this.screenRepository.checkSlot(dto.screenId, startTime, endTime);
                if (!isSlotAvailable) {
                    throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_TIME_CONFLICT, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
                }
                // Create Show
                const newShow = new show_entity_1.Show(null, startTime, new mongoose_1.default.Types.ObjectId(dto.movieId), new mongoose_1.default.Types.ObjectId(dto.theaterId), new mongoose_1.default.Types.ObjectId(dto.screenId), new mongoose_1.default.Types.ObjectId(vendorId), 'Scheduled', [], endTime, showDate);
                const savedShow = await this.showRepository.create(newShow);
                createdShows.push(savedShow);
            }
            return createdShows;
        }
        catch (error) {
            console.error('❌ Error creating shows:', error);
            if (error instanceof custom_error_1.CustomError) {
                throw error;
            }
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_SAVED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CreateShowUseCase = CreateShowUseCase;
exports.CreateShowUseCase = CreateShowUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ShowRepository')),
    __param(1, (0, tsyringe_1.inject)('ScreenRepository')),
    __param(2, (0, tsyringe_1.inject)('MovieRepository')),
    __param(3, (0, tsyringe_1.inject)('TheaterRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], CreateShowUseCase);
