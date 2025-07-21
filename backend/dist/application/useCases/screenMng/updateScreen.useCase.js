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
exports.UpdateScreenUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const screen_entity_1 = require("../../../domain/entities/screen.entity");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const mongoose_1 = __importDefault(require("mongoose"));
let UpdateScreenUseCase = class UpdateScreenUseCase {
    constructor(screenRepository, theaterRepository) {
        this.screenRepository = screenRepository;
        this.theaterRepository = theaterRepository;
    }
    async execute(id, dto) {
        try {
            const existingScreen = await this.screenRepository.findById(id);
            if (!existingScreen) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
            }
            const existingScreenName = await this.screenRepository.findScreenByName(dto.name, dto.theaterId, id);
            if (existingScreenName) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SCREEN_NAME_ALREADY_EXISTS, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            let theaterId = existingScreen.theaterId;
            if (dto.theaterId && dto.theaterId !== existingScreen.theaterId?.toString()) {
                if (!mongoose_1.default.Types.ObjectId.isValid(dto.theaterId)) {
                    throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_THEATER_ID, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
                }
                theaterId = new mongoose_1.default.Types.ObjectId(dto.theaterId);
            }
            let seatLayoutId = existingScreen.seatLayoutId;
            if (dto.seatLayoutId) {
                if (!mongoose_1.default.Types.ObjectId.isValid(dto.seatLayoutId)) {
                    throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_SEAT_LAYOUT_ID, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
                }
                seatLayoutId = new mongoose_1.default.Types.ObjectId(dto.seatLayoutId);
            }
            const oldTheaterId = existingScreen.theaterId?._id.toString() || '';
            const updatedScreen = new screen_entity_1.Screen(id, dto.name || existingScreen.name, theaterId, seatLayoutId, existingScreen.filledTimes, {
                is3D: dto.amenities.is3D ?? existingScreen.amenities.is3D,
                is4K: dto.amenities.is4K ?? existingScreen.amenities.is4K,
                isDolby: dto.amenities.isDolby ?? existingScreen.amenities.isDolby,
            }, existingScreen.createdAt, new Date());
            const savedScreen = await this.screenRepository.updateScreenDetails(updatedScreen);
            if (!savedScreen) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_SAVED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
            }
            if (oldTheaterId !== savedScreen.theaterId?._id.toString()) {
                await this.theaterRepository.updateScreens(oldTheaterId, savedScreen._id?.toString() || '', 'pull');
                await this.theaterRepository.updateScreens(savedScreen.theaterId?._id.toString() || '', savedScreen._id?.toString() || '', 'push');
            }
            return savedScreen;
        }
        catch (error) {
            if (error instanceof custom_error_1.CustomError) {
                throw error;
            }
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.FAILED_UPDATING_RECORD, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.UpdateScreenUseCase = UpdateScreenUseCase;
exports.UpdateScreenUseCase = UpdateScreenUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ScreenRepository')),
    __param(1, (0, tsyringe_1.inject)('TheaterRepository')),
    __metadata("design:paramtypes", [Object, Object])
], UpdateScreenUseCase);
