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
exports.CreateNewTheaterUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const theater_entity_1 = require("../../../domain/entities/theater.entity");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const mongoose_1 = __importDefault(require("mongoose"));
let CreateNewTheaterUseCase = class CreateNewTheaterUseCase {
    constructor(theaterRepository) {
        this.theaterRepository = theaterRepository;
    }
    async execute(dto) {
        // Check for existing theater by email
        const existingTheater = await this.theaterRepository.findByEmail(dto.email);
        if (existingTheater) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.EMAIL_ALREADY_EXISTS, httpResponseCode_utils_1.HttpResCode.CONFLICT);
        }
        dto.location.type = 'Point';
        const newTheater = new theater_entity_1.Theater(null, [], dto.name, 'verifying', dto.location, dto.facilities, new Date(), new Date(), parseInt(dto.intervalTime), dto.gallery, dto.email, parseInt(dto.phone, 10), dto.description, new mongoose_1.default.Types.ObjectId(dto.vendorId), 0, 0);
        try {
            const savedTheater = await this.theaterRepository.create(newTheater);
            return savedTheater;
        }
        catch (error) {
            throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.INTERNAL_SERVER_ERROR, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CreateNewTheaterUseCase = CreateNewTheaterUseCase;
exports.CreateNewTheaterUseCase = CreateNewTheaterUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('TheaterRepository')),
    __metadata("design:paramtypes", [Object])
], CreateNewTheaterUseCase);
