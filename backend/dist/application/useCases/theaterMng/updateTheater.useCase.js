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
exports.UpdateTheaterUseCase = void 0;
// src/application/useCases/Vendor/updateTheater.useCase.ts
const tsyringe_1 = require("tsyringe");
const vendor_dto_1 = require("../../dtos/vendor.dto");
const sendResponse_utils_1 = require("../../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const custom_error_1 = require("../../../utils/errors/custom.error");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const commonSuccessMsg_constants_1 = require("../../../utils/constants/commonSuccessMsg.constants");
const theater_entity_1 = require("../../../domain/entities/theater.entity");
let UpdateTheaterUseCase = class UpdateTheaterUseCase {
    constructor(theaterRepository) {
        this.theaterRepository = theaterRepository;
    }
    async execute(id, data, res) {
        try {
            const theater = await this.theaterRepository.findById(id);
            if (!theater) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.NOT_FOUND, httpResponseCode_utils_1.HttpResMsg.THEATER_NOT_FOUND);
                return;
            }
            // Update theater fields
            const updatedTheater = new theater_entity_1.Theater(theater._id, theater.screens, data.name || theater.name, theater.status, theater.location, data.facilities || null, theater.createdAt, new Date(), data.intervalTime || theater.intervalTime, data.gallery || theater.gallery, data.email || theater.email, data.phone || theater.phone, data.description || theater.description, theater.vendorId, theater.rating, theater.ratingCount);
            // Persist updates
            const savedTheater = await this.theaterRepository.updateTheaterDetails(updatedTheater);
            // Prepare response DTO
            const responseDTO = new vendor_dto_1.TheaterResponseDTO(savedTheater._id.toString(), savedTheater.name, savedTheater.status, savedTheater.location, savedTheater.facilities, savedTheater.intervalTime, savedTheater.gallery, savedTheater.email, savedTheater.phone, savedTheater.rating, savedTheater.ratingCount, savedTheater.description, null, savedTheater.createdAt, savedTheater.updatedAt);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.THEATER_UPDATED, responseDTO);
        }
        catch (error) {
            const errorMessage = error instanceof custom_error_1.CustomError
                ? error.message
                : commonErrorMsg_constants_1.default.GENERAL.FAILED_UPDATING_THEATER;
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR, errorMessage);
        }
    }
};
exports.UpdateTheaterUseCase = UpdateTheaterUseCase;
exports.UpdateTheaterUseCase = UpdateTheaterUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('TheaterRepository')),
    __metadata("design:paramtypes", [Object])
], UpdateTheaterUseCase);
