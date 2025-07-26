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
exports.MovieMngController = void 0;
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const class_validator_1 = require("class-validator");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
const custom_error_1 = require("../../utils/errors/custom.error");
const movie_dto_1 = require("../../application/dtos/movie.dto");
const commonSuccessMsg_constants_1 = require("../../utils/constants/commonSuccessMsg.constants");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Controller for managing movie-related operations, accessible by both admins and users.
 * @implements {IMovieMngController}
 */
let MovieMngController = class MovieMngController {
    /**
     * Constructs an instance of MovieMngController.
     * @param {ICreateMovieUseCase} createMovieUseCase - Use case for creating a new movie.
     * @param {IFetchMoviesUseCase} fetchMoviesUseCase - Use case for fetching movies (admin view).
     * @param {IUpdateMovieStatusUseCase} updateMovieStatusUseCase - Use case for updating a movie's status.
     * @param {IUpdateMovieUseCase} updateMovieUseCase - Use case for updating movie details.
     * @param {IFindMovieByIdUseCase} findMovieByIdUseCase - Use case for finding a movie by ID.
     * @param {IFetchMoviesUserUseCase} fetchMoviesUserUseCase - Use case for fetching movies (user view).
     * @param {IRateMovieUseCase} rateMovieUseCase - Use case for submitting movie and theater ratings.
     * @param {IIsMovieLikedUseCase} isMovieLikedUseCase - Use case for checking if a movie is liked by a user.
     * @param {ILikeOrUnlikeMovieUseCase} likeOrUnlikeMovieUseCase - Use case for liking or unliking a movie.
     */
    constructor(createMovieUseCase, fetchMoviesUseCase, updateMovieStatusUseCase, updateMovieUseCase, findMovieByIdUseCase, fetchMoviesUserUseCase, rateMovieUseCase, isMovieLikedUseCase, likeOrUnlikeMovieUseCase) {
        this.createMovieUseCase = createMovieUseCase;
        this.fetchMoviesUseCase = fetchMoviesUseCase;
        this.updateMovieStatusUseCase = updateMovieStatusUseCase;
        this.updateMovieUseCase = updateMovieUseCase;
        this.findMovieByIdUseCase = findMovieByIdUseCase;
        this.fetchMoviesUserUseCase = fetchMoviesUserUseCase;
        this.rateMovieUseCase = rateMovieUseCase;
        this.isMovieLikedUseCase = isMovieLikedUseCase;
        this.likeOrUnlikeMovieUseCase = likeOrUnlikeMovieUseCase;
    }
    /**
     * Handles the creation of a new movie by an admin.
     * @param {Request} req - The Express request object, containing movie details in the body.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async createMovie(req, res, next) {
        try {
            const { name, genre, trailerLink, poster, duration, description, language, releaseDate, is3D, crew, cast, } = req.body;
            const dto = new movie_dto_1.CreateMovieDTO(name, genre, trailerLink, 0, poster, duration, description, language, releaseDate, is3D, crew, cast);
            const movie = await this.createMovieUseCase.execute(dto);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.MOVIE_ADDED, movie);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Fetches a list of movies with pagination, search, and filtering options for admin view.
     * @param {Request} req - The Express request object, containing query parameters for filtering.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async fetchMovies(req, res, next) {
        try {
            const { page, limit, search, status, genre, sortBy, sortOrder } = req.query;
            // Convert query parameters
            const params = {
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                search: search ? search : undefined,
                status: status ? status.split(',') : undefined,
                genre: genre ? genre.split(',') : undefined,
                sortBy: sortBy ? sortBy : undefined,
                sortOrder: sortOrder ? sortOrder : undefined,
            };
            // Validate DTO
            const dto = new movie_dto_1.FetchMoviesDTO();
            Object.assign(dto, params);
            const errors = await (0, class_validator_1.validate)(dto);
            if (errors.length > 0) {
                throw new custom_error_1.CustomError('Invalid query parameters', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const result = await this.fetchMoviesUseCase.execute(params);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Updates the status of a movie.
     * @param {Request} req - The Express request object, containing movie ID and new status in the body.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async updateMovieStatus(req, res, next) {
        try {
            const { id, status } = req.body;
            const dto = new movie_dto_1.UpdateMovieStatusDTO(id, status);
            const movie = await this.updateMovieStatusUseCase.execute(dto);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.MOVIE_STATUS_UPDATED, movie);
        }
        catch (error) {
            const errorMessage = error instanceof custom_error_1.CustomError ? error.message : commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_FOUND;
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST, errorMessage);
        }
    }
    /**
     * Updates the details of an existing movie.
     * @param {Request} req - The Express request object, containing updated movie details in the body.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async updateMovie(req, res, next) {
        try {
            const { id, name, genre, trailer, rating, poster, duration, description, language, releaseDate, is3D, crew, cast, } = req.body;
            const dto = new movie_dto_1.UpdateMovieDTO(id, name, genre, trailer, rating, poster, duration, description, language, releaseDate, is3D, crew, cast);
            const movie = await this.updateMovieUseCase.execute(dto);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.MOVIE_UPDATED, movie);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Finds a movie by its ID.
     * @param {Request} req - The Express request object, containing the movie ID in `req.params.id`.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async findMovieById(req, res, next) {
        try {
            const { id } = req.params;
            // Validate ID format
            if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new custom_error_1.CustomError('Invalid or missing movie ID', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const movie = await this.findMovieByIdUseCase.execute(id);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, movie);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Fetches a list of movies with pagination, search, filtering, and location-based relevance for user view.
     * Uses latitude and longitude from cookies for location awareness, defaulting to "Calicut" if not present.
     * @param {Request} req - The Express request object, containing query parameters and potentially cookies for location.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async fetchMoviesUser(req, res, next) {
        try {
            const { page, limit, search, status, genre, sortBy, sortOrder } = req.query;
            let { latitude, longitude, selectedLocation } = req.cookies;
            if (!latitude || !longitude || !selectedLocation) {
                selectedLocation = 'Calicut';
                latitude = 11.5;
                longitude = 76.0;
            }
            const params = {
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                search: search ? search : undefined,
                status: status ? status.split(',') : undefined,
                genre: genre ? genre.split(',') : undefined,
                sortBy: sortBy ? sortBy : undefined,
                sortOrder: sortOrder ? sortOrder : undefined,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                selectedLocation: selectedLocation,
            };
            // Validate DTO
            const dto = new movie_dto_1.FetchMoviesUserDTO();
            Object.assign(dto, params);
            const errors = await (0, class_validator_1.validate)(dto);
            if (errors.length > 0) {
                throw new custom_error_1.CustomError('Invalid query or location parameters', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const result = await this.fetchMoviesUserUseCase.execute(params);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Submits a rating for a movie and a theater by a user.
     * @param {Request} req - The Express request object, containing `movieId`, `theaterId`, `movieRating`, `theaterRating`, and `review` in the body. User ID is from `req.decoded.userId`.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async submitRating(req, res, next) {
        try {
            const { movieId, theaterId, movieRating, theaterRating, review } = req.body;
            const userId = req.decoded?.userId;
            if (!movieId || !theaterId || !userId) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.MISSING_REQUIRED_FIELDS, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const dto = new movie_dto_1.SubmitRatingDTO(userId, movieId, theaterId, theaterRating, movieRating, review);
            const result = await this.rateMovieUseCase.execute(dto);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, 'Rating submitted successfully', result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Handles liking or unliking a movie by a user.
     * @param {Request} req - The Express request object, containing `movieId` and `isLike` (boolean) in the body. User ID is from `req.decoded.userId`.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async likeOrUnlikeMovie(req, res, next) {
        try {
            const userId = req.decoded?.userId;
            if (!userId) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            const { movieId, isLike } = req.body;
            const response = await this.likeOrUnlikeMovieUseCase.execute(movieId, userId, isLike);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.LIKE_UPDATED, response);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Checks if a user has liked a specific movie.
     * @param {Request} req - The Express request object, containing `movieId` in `req.params.id`. User ID is from `req.decoded.userId`.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async isMovieLiked(req, res, next) {
        try {
            const userId = req.decoded?.userId;
            if (!userId) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            const { movieId } = req.params;
            const response = await this.isMovieLikedUseCase.execute(movieId, userId);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.LIKE_FETCHED, response);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.MovieMngController = MovieMngController;
exports.MovieMngController = MovieMngController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('CreateMovieUseCase')),
    __param(1, (0, tsyringe_1.inject)('FetchMoviesUseCase')),
    __param(2, (0, tsyringe_1.inject)('UpdateMovieStatusUseCase')),
    __param(3, (0, tsyringe_1.inject)('UpdateMovieUseCase')),
    __param(4, (0, tsyringe_1.inject)('FindMovieByIdUseCase')),
    __param(5, (0, tsyringe_1.inject)('FetchMoviesUserUseCase')),
    __param(6, (0, tsyringe_1.inject)('RateMovieUseCase')),
    __param(7, (0, tsyringe_1.inject)('IsMovieLikedUseCase')),
    __param(8, (0, tsyringe_1.inject)('LikeOrUnlikeMovieUseCase')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], MovieMngController);
