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
exports.FetchTheaterOfVendorUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
let FetchTheaterOfVendorUseCase = class FetchTheaterOfVendorUseCase {
    constructor(theaterRepository) {
        this.theaterRepository = theaterRepository;
    }
    /**
     * Fetches theaters for a specific vendor.
     * @param params - The parameters for fetching theaters.
     * @param params.vendorId - The ID of the vendor.
     * @param params.page - The page number for pagination (default: 1).
     * @param params.limit - The number of theaters per page (default: 8).
     * @param params.search - The search term to filter theaters by name.
     * @param params.status - The status of the theaters to filter by.
     * @param params.location - The location of the theaters to filter by.
     * @param params.sortBy - The field to sort the theaters by.
     * @param params.sortOrder - The order to sort the theaters ('asc' or 'desc').
     * @returns An object containing the list of theaters, total count, and total pages.
     */
    async execute(params = { vendorId: '' }) {
        try {
            const page = params?.page || 1;
            const limit = params?.limit || 8;
            const { theaters, totalCount } = await this.theaterRepository.findTheatersByVendor(params);
            const totalPages = Math.ceil(totalCount / limit);
            return {
                theaters,
                totalCount,
                totalPages,
            };
        }
        catch (error) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
        }
    }
};
exports.FetchTheaterOfVendorUseCase = FetchTheaterOfVendorUseCase;
exports.FetchTheaterOfVendorUseCase = FetchTheaterOfVendorUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('TheaterRepository')),
    __metadata("design:paramtypes", [Object])
], FetchTheaterOfVendorUseCase);
