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
exports.ShowManagementController = void 0;
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const custom_error_1 = require("../../utils/errors/custom.error");
const showAgenda_service_1 = require("../../infrastructure/services/showAgenda.service");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Controller for managing movie shows, including creation, updates, deletion, and fetching for both vendors and users.
 * @implements {IShowManagementController}
 */
let ShowManagementController = class ShowManagementController {
    /**
     * Constructs an instance of ShowManagementController.
     * @param {ICreateShowUseCase} createShowUseCase - Use case for creating a new show.
     * @param {IUpdateShowUseCase} updateShowUseCase - Use case for updating an existing show.
     * @param {IUpdateShowStatusUseCase} updateShowStatusUseCase - Use case for updating a show's status.
     * @param {IDeleteShowUseCase} deleteShowUseCase - Use case for deleting a show.
     * @param {IFindShowByIdUseCase} findShowByIdUseCase - Use case for finding a show by ID.
     * @param {IFindAllShowsUseCase} findAllShowsUseCase - Use case for fetching all shows (admin view).
     * @param {IFindShowsByVendorUseCase} findShowsByVendorUseCase - Use case for fetching shows by a specific vendor.
     * @param {IFetchShowSelectionUseCase} fetchShowSelectionUseCase - Use case for fetching show selection options for users.
     * @param {ICreateRecurringShowUseCase} createRecurringShowUseCase - Use case for creating recurring shows.
     * @param {ShowJobService} showJobService - Service for scheduling and canceling show-related jobs.
     */
    constructor(createShowUseCase, updateShowUseCase, updateShowStatusUseCase, deleteShowUseCase, findShowByIdUseCase, findAllShowsUseCase, findShowsByVendorUseCase, fetchShowSelectionUseCase, createRecurringShowUseCase, showJobService) {
        this.createShowUseCase = createShowUseCase;
        this.updateShowUseCase = updateShowUseCase;
        this.updateShowStatusUseCase = updateShowStatusUseCase;
        this.deleteShowUseCase = deleteShowUseCase;
        this.findShowByIdUseCase = findShowByIdUseCase;
        this.findAllShowsUseCase = findAllShowsUseCase;
        this.findShowsByVendorUseCase = findShowsByVendorUseCase;
        this.fetchShowSelectionUseCase = fetchShowSelectionUseCase;
        this.createRecurringShowUseCase = createRecurringShowUseCase;
        this.showJobService = showJobService;
    }
    /**
     * Handles the creation of one or more new shows. Schedules related jobs upon successful creation.
     * @param {Request} req - The Express request object, containing show details in the body. Requires `req.decoded.userId` for the vendor ID.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async createShow(req, res, next) {
        try {
            const vendorId = req.decoded?.userId;
            if (!vendorId) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.VENDOR_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const shows = await this.createShowUseCase.execute(vendorId, req.body);
            for (const show of shows) {
                try {
                    await this.showJobService.scheduleShowJobs(show._id, show.startTime, show.endTime);
                }
                catch (scheduleError) {
                    console.error('❌ ~ ShowManagementController ~ createShow ~ Failed to schedule jobs for show:', show._id, scheduleError);
                }
            }
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.CREATED, httpResponseCode_utils_1.HttpResMsg.SUCCESS, shows);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Handles the update of an existing show. Reschedules related jobs upon successful update.
     * @param {Request} req - The Express request object, containing show ID in `req.params.id` and updated show details in the body.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async updateShow(req, res, next) {
        const { id } = req.params;
        try {
            const show = await this.updateShowUseCase.execute({ id, ...req.body });
            try {
                await this.showJobService.scheduleShowJobs(show._id, show.startTime, show.endTime);
            }
            catch (scheduleError) {
                console.error('❌ ~ ShowManagementController ~ updateShow ~ Failed to reschedule jobs for show:', show._id, scheduleError);
            }
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, show);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Updates the status of a specific show (e.g., 'active', 'cancelled').
     * @param {Request} req - The Express request object, containing show ID in `req.params.id` and new status in `req.body.status`.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async updateShowStatus(req, res, next) {
        const { id } = req.params;
        const { status } = req.body;
        try {
            const show = await this.updateShowStatusUseCase.execute(id, status);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, show);
        }
        catch (error) {
            console.error('❌ ~ ShowManagementController ~ updateShowStatus ~ Error:', error);
            next(error);
        }
    }
    /**
     * Deletes a show by its ID. Cancels related jobs upon successful deletion.
     * @param {Request} req - The Express request object, containing show ID in `req.params.id`.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async deleteShow(req, res, next) {
        const { id } = req.params;
        try {
            await this.deleteShowUseCase.execute(id);
            try {
                await this.showJobService.cancelShowJobs(id);
            }
            catch (cancelError) {
                console.error('❌ ~ ShowManagementController ~ deleteShow ~ Failed to cancel jobs for show:', id, cancelError);
            }
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, {
                message: 'Show deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Retrieves a single show by its ID.
     * @param {Request} req - The Express request object, containing show ID in `req.params.id`.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async getShowById(req, res, next) {
        const { id } = req.params;
        try {
            const show = await this.findShowByIdUseCase.execute(id);
            if (!show) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, show);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Fetches all shows with pagination, search, and filtering options (typically for admin or general listing).
     * @param {Request} req - The Express request object, containing various query parameters for filtering.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async getAllShows(req, res, next) {
        try {
            const { page, limit, search, theaterId, movieId, screenId, status, sortBy, sortOrder } = req.query;
            const params = {
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                search: search ? search : undefined,
                theaterId: theaterId ? theaterId : undefined,
                movieId: movieId ? movieId : undefined,
                screenId: screenId ? screenId : undefined,
                status: status ? status : undefined,
                sortBy: sortBy ? sortBy : undefined,
                sortOrder: sortOrder ? sortOrder : undefined,
            };
            const result = await this.findAllShowsUseCase.execute(params);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Fetches shows belonging to a specific vendor with pagination and filtering.
     * @param {Request} req - The Express request object. Requires `req.decoded.userId` for the vendor ID and optional query parameters for filtering.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async getShowsOfVendor(req, res, next) {
        try {
            const { page, limit, search, status, sortBy, sortOrder } = req.query;
            const vendorId = req.decoded?.userId;
            if (!vendorId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            const params = {
                vendorId,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                search: search ? search : undefined,
                status: status ? status : undefined,
                sortBy: sortBy ? sortBy : undefined,
                sortOrder: sortOrder ? sortOrder : undefined,
            };
            const result = await this.findShowsByVendorUseCase.execute(params);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Fetches show selection options for a given movie, considering user's location and various filters.
     * @param {Request} req - The Express request object. Contains `movieId` in `req.params`, and optional query parameters for `date`, `priceRanges`, `timeSlots`, `facilities`. Also uses `latitude`, `longitude`, and `selectedLocation` from `req.cookies`.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async getShowSelection(req, res, next) {
        try {
            const { movieId } = req.params;
            const { date, priceRanges, timeSlots, facilities } = req.query;
            let { latitude, longitude, selectedLocation } = req.cookies;
            if (!latitude || !longitude || !selectedLocation) {
                selectedLocation = 'Calicut';
                latitude = 11.5;
                longitude = 76.0;
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(movieId)) {
                throw new custom_error_1.CustomError('Invalid movie ID', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const params = {
                movieId,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                selectedLocation: selectedLocation,
                date: date,
                priceRanges: priceRanges
                    ? JSON.parse(priceRanges).map(({ min, max }) => ({ min, max }))
                    : undefined,
                timeSlots: timeSlots
                    ? JSON.parse(timeSlots).map(({ start, end }) => ({ start, end }))
                    : undefined,
                facilities: facilities ? facilities.split(',') : undefined,
            };
            const result = await this.fetchShowSelectionUseCase.execute(params);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Creates recurring shows based on an existing show. Schedules jobs for each newly created show.
     * @param {Request} req - The Express request object, containing `showId`, `startDate`, and `endDate` in the body. Requires `req.decoded.userId` for the vendor ID.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async createRecurringShow(req, res, next) {
        try {
            const { showId, startDate, endDate } = req.body;
            const vendorId = req.decoded?.userId;
            if (!vendorId) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.VENDOR_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const shows = await this.createRecurringShowUseCase.execute(showId, startDate, endDate, vendorId);
            for (const show of shows) {
                try {
                    await this.showJobService.scheduleShowJobs(show._id, show.startTime, show.endTime);
                }
                catch (scheduleError) {
                    console.error('❌ ~ ShowManagementController ~ createRecurringShow ~ Failed to schedule jobs for show:', show._id, scheduleError);
                }
            }
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.CREATED, httpResponseCode_utils_1.HttpResMsg.SUCCESS, shows);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.ShowManagementController = ShowManagementController;
exports.ShowManagementController = ShowManagementController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('CreateShowUseCase')),
    __param(1, (0, tsyringe_1.inject)('UpdateShowUseCase')),
    __param(2, (0, tsyringe_1.inject)('UpdateShowStatusUseCase')),
    __param(3, (0, tsyringe_1.inject)('DeleteShowUseCase')),
    __param(4, (0, tsyringe_1.inject)('FindShowByIdUseCase')),
    __param(5, (0, tsyringe_1.inject)('FindAllShowsUseCase')),
    __param(6, (0, tsyringe_1.inject)('FindShowsByVendorUseCase')),
    __param(7, (0, tsyringe_1.inject)('FetchShowSelectionUseCase')),
    __param(8, (0, tsyringe_1.inject)('CreateRecurringShowUseCase')),
    __param(9, (0, tsyringe_1.inject)('ShowJobService')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, showAgenda_service_1.ShowJobService])
], ShowManagementController);
