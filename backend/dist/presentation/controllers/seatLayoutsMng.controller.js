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
exports.SeatLayoutController = void 0;
const tsyringe_1 = require("tsyringe");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const custom_error_1 = require("../../utils/errors/custom.error");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
const seatLayout_1 = require("../../application/dtos/seatLayout");
/**
 * Controller for managing seat layout operations, primarily for vendors.
 * @implements {ISeatLayoutController}
 */
let SeatLayoutController = class SeatLayoutController {
    /**
     * Constructs an instance of SeatLayoutController.
     * @param {ICreateSeatLayoutUseCase} createSeatLayoutUseCase - Use case for creating a new seat layout.
     * @param {IUpdateSeatLayoutUseCase} updateSeatLayoutUseCase - Use case for updating an existing seat layout.
     * @param {IFindSeatLayoutsByVendorUseCase} findSeatLayoutsByVendorUseCase - Use case for fetching seat layouts belonging to a specific vendor.
     * @param {IFindSeatLayoutByIdUseCase} findSeatLayoutByIdUseCase - Use case for finding a seat layout by its ID.
     */
    constructor(createSeatLayoutUseCase, updateSeatLayoutUseCase, findSeatLayoutsByVendorUseCase, findSeatLayoutByIdUseCase) {
        this.createSeatLayoutUseCase = createSeatLayoutUseCase;
        this.updateSeatLayoutUseCase = updateSeatLayoutUseCase;
        this.findSeatLayoutsByVendorUseCase = findSeatLayoutsByVendorUseCase;
        this.findSeatLayoutByIdUseCase = findSeatLayoutByIdUseCase;
    }
    /**
     * Handles the creation of a new seat layout.
     * @param {Request} req - The Express request object, containing seat layout details in the body.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async createSeatLayout(req, res, next) {
        try {
            const { uuid, vendorId, layoutName, seatPrice, rowCount, columnCount, seats, capacity } = req.body;
            const dto = new seatLayout_1.CreateSeatLayoutDTO(uuid, vendorId, layoutName, seatPrice, rowCount, columnCount, seats, capacity);
            await this.createSeatLayoutUseCase.execute(dto, res);
        }
        catch (error) {
            const errorMessage = error instanceof custom_error_1.CustomError ? error.message : commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_SAVED;
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST, errorMessage);
        }
    }
    /**
     * Handles the update of an existing seat layout.
     * @param {Request} req - The Express request object, containing seat layout ID in `req.params.id` and updated details in the body.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async updateSeatLayout(req, res, next) {
        try {
            const { uuid, layoutName, seatPrice, rowCount, columnCount, seats, capacity } = req.body;
            const layoutId = req.params.id;
            const dto = new seatLayout_1.UpdateSeatLayoutDTO(layoutId, uuid, layoutName, seatPrice, rowCount, columnCount, seats, capacity);
            await this.updateSeatLayoutUseCase.execute(dto, res);
        }
        catch (error) {
            const errorMessage = error instanceof custom_error_1.CustomError ? error.message : commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_UPDATED;
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST, errorMessage);
        }
    }
    /**
     * Finds seat layouts belonging to a specific vendor with pagination and filtering.
     * @param {Request} req - The Express request object. Requires `req.decoded.userId` for the vendor ID and optional query parameters.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async findSeatLayoutsByVendor(req, res, next) {
        try {
            const vendorId = req.decoded?.userId;
            if (!vendorId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            const { page, limit, search, sortBy, sortOrder } = req.query;
            const params = {
                vendorId,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                search: search ? search : undefined,
                sortBy: sortBy ? sortBy : undefined,
                sortOrder: sortOrder ? sortOrder : undefined,
            };
            const result = await this.findSeatLayoutsByVendorUseCase.execute(params);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            const errorMessage = error instanceof custom_error_1.CustomError
                ? error.message
                : commonErrorMsg_constants_1.default.GENERAL.FAILED_FETCHING_RECORDS;
            (0, sendResponse_utils_1.sendResponse)(res, error instanceof custom_error_1.CustomError ? error.statusCode : httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR, errorMessage);
        }
    }
    /**
     * Finds a seat layout by its ID.
     * @param {Request} req - The Express request object, containing the seat layout ID in `req.params.id`.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async findSeatLayoutById(req, res, next) {
        try {
            const layoutId = req.params.id;
            if (!layoutId) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_SEAT_LAYOUT_ID, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const seatLayout = await this.findSeatLayoutByIdUseCase.execute(layoutId, res);
            if (!seatLayout) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.SEAT_LAYOUT_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
            }
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, seatLayout);
        }
        catch (error) {
            const errorMessage = error instanceof custom_error_1.CustomError
                ? error.message
                : commonErrorMsg_constants_1.default.GENERAL.FAILED_FETCHING_RECORDS;
            (0, sendResponse_utils_1.sendResponse)(res, error instanceof custom_error_1.CustomError ? error.statusCode : httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR, errorMessage);
        }
    }
};
exports.SeatLayoutController = SeatLayoutController;
exports.SeatLayoutController = SeatLayoutController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('CreateSeatLayoutUseCase')),
    __param(1, (0, tsyringe_1.inject)('UpdateSeatLayoutUseCase')),
    __param(2, (0, tsyringe_1.inject)('FindSeatLayoutsByVendorUseCase')),
    __param(3, (0, tsyringe_1.inject)('FindSeatLayoutByIdUseCase')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], SeatLayoutController);
