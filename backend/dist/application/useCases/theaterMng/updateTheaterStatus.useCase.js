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
exports.UpdateTheaterStatusUseCase = void 0;
const vendor_dto_1 = require("../../dtos/vendor.dto");
const sendResponse_utils_1 = require("../../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const tsyringe_1 = require("tsyringe");
const commonSuccessMsg_constants_1 = require("../../../utils/constants/commonSuccessMsg.constants");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
let UpdateTheaterStatusUseCase = class UpdateTheaterStatusUseCase {
    constructor(vendorRepository) {
        this.vendorRepository = vendorRepository;
    }
    async execute(id, status, res) {
        const validStatuses = ['active', 'blocked', 'verified', 'verifying', 'pending', 'request'];
        if (!validStatuses.includes(status)) {
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST, commonErrorMsg_constants_1.default.VALIDATION.INVALID_STATUS);
            return;
        }
        const vendor = await this.vendorRepository.findById(id);
        if (!vendor) {
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.NOT_FOUND, httpResponseCode_utils_1.HttpResMsg.THEATER_NOT_FOUND);
            return;
        }
        vendor.status = status;
        vendor.updatedAt = new Date();
        await this.vendorRepository.updateVerificationStatus(id, vendor);
        const responseDTO = new vendor_dto_1.TheaterResponseDTO(vendor._id.toString(), vendor.name, vendor.status, vendor.location, vendor.facilities, vendor.intervalTime, vendor.gallery, vendor.email, vendor.phone, vendor.rating, vendor.ratingCount, vendor.description, null, vendor.createdAt, vendor.updatedAt);
        (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.STATUS_UPDATED, responseDTO);
    }
};
exports.UpdateTheaterStatusUseCase = UpdateTheaterStatusUseCase;
exports.UpdateTheaterStatusUseCase = UpdateTheaterStatusUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('TheaterRepository')),
    __metadata("design:paramtypes", [Object])
], UpdateTheaterStatusUseCase);
