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
exports.UpdateShowUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const show_entity_1 = require("../../../domain/entities/show.entity");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const mongoose_1 = __importDefault(require("mongoose"));
let UpdateShowUseCase = class UpdateShowUseCase {
    constructor(showRepository, screenRepository, movieRepository, theaterRepository) {
        this.showRepository = showRepository;
        this.screenRepository = screenRepository;
        this.movieRepository = movieRepository;
        this.theaterRepository = theaterRepository;
    }
    async execute(dto) {
        console.log('🚀 ~ UpdateShowUseCase ~ execute ~ dto:', dto);
        try {
            const existingShow = await this.showRepository.findById(dto.id);
            if (!existingShow) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            if (['Running', 'Completed', 'Cancelled'].includes(existingShow.status)) {
                throw new custom_error_1.CustomError(`Cannot update a ${existingShow.status.toLowerCase()} show`, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const movieId = dto.movieId || existingShow.movieId;
            const movie = await this.movieRepository.findById(movieId);
            if (!movie || !movie.duration) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.MOVIE_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const { hours, minutes, seconds } = movie.duration;
            const movieDurationMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
            const theaterId = dto.theaterId || existingShow.theaterId;
            const theater = await this.theaterRepository.findById(theaterId);
            if (!theater || typeof theater.intervalTime !== 'number') {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.THEATER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const intervalGapMs = theater.intervalTime * 60000;
            let startTime = dto.startTime ? new Date(dto.startTime) : existingShow.startTime;
            if (isNaN(startTime.getTime())) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_START_TIME, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            let showDate;
            if (dto.showDate) {
                showDate = new Date(dto.showDate);
                if (isNaN(showDate.getTime())) {
                    throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_DATE, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
                }
            }
            else {
                showDate = existingShow.showDate ?? new Date();
            }
            // Ensure startTime aligns with showDate
            const adjustedStartTime = new Date(startTime);
            adjustedStartTime.setFullYear(showDate.getFullYear(), showDate.getMonth(), showDate.getDate());
            const adjustedEndTime = new Date(adjustedStartTime.getTime() + movieDurationMs + intervalGapMs);
            if (dto.endTime) {
                const providedEndTime = new Date(dto.endTime);
                if (Math.abs(providedEndTime.getTime() - adjustedEndTime.getTime()) > 1000) {
                    throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_END_TIME, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
                }
            }
            const isSlotAvailable = await this.screenRepository.checkSlot(dto.screenId || existingShow.screenId, adjustedStartTime, adjustedEndTime, dto.id);
            if (!isSlotAvailable) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_TIME_CONFLICT, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const updatedShow = new show_entity_1.Show(dto.id, adjustedStartTime, new mongoose_1.default.Types.ObjectId(movieId), new mongoose_1.default.Types.ObjectId(theaterId), new mongoose_1.default.Types.ObjectId(dto.screenId || existingShow.screenId), new mongoose_1.default.Types.ObjectId(existingShow.vendorId), existingShow.status, existingShow.bookedSeats, adjustedEndTime, showDate);
            return await this.showRepository.update(updatedShow, existingShow.startTime);
        }
        catch (error) {
            console.error('❌ Error updating show:', error);
            if (error instanceof custom_error_1.CustomError)
                throw error;
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_SAVED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.UpdateShowUseCase = UpdateShowUseCase;
exports.UpdateShowUseCase = UpdateShowUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ShowRepository')),
    __param(1, (0, tsyringe_1.inject)('ScreenRepository')),
    __param(2, (0, tsyringe_1.inject)('MovieRepository')),
    __param(3, (0, tsyringe_1.inject)('TheaterRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], UpdateShowUseCase);
