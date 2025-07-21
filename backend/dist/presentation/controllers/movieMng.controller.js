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
let MovieMngController = class MovieMngController {
    constructor(createMovieUseCase, fetchMoviesUseCase, updateMovieStatusUseCase, updateMovieUseCase, findMovieByIdUseCase, fetchMoviesUserUseCase, rateMovieUseCase, movieRepository) {
        this.createMovieUseCase = createMovieUseCase;
        this.fetchMoviesUseCase = fetchMoviesUseCase;
        this.updateMovieStatusUseCase = updateMovieStatusUseCase;
        this.updateMovieUseCase = updateMovieUseCase;
        this.findMovieByIdUseCase = findMovieByIdUseCase;
        this.fetchMoviesUserUseCase = fetchMoviesUserUseCase;
        this.rateMovieUseCase = rateMovieUseCase;
        this.movieRepository = movieRepository;
    }
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
    async submitRating(req, res, next) {
        try {
            const { movieId, theaterId, movieRating, theaterRating, review } = req.body;
            const userId = req.decoded?.userId;
            if (!movieId || !theaterId || !userId) {
                throw new custom_error_1.CustomError('Missing required fields', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const dto = new movie_dto_1.SubmitRatingDTO(userId, movieId, theaterId, theaterRating, movieRating, review);
            const result = await this.rateMovieUseCase.execute(dto);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, 'Rating submitted successfully', result);
        }
        catch (error) {
            next(error);
        }
    }
    async likeOrUnlikeMovie(req, res, next) {
        try {
            const { movieId, isLike } = req.body;
            const userId = req.decoded?.userId;
            if (!movieId || typeof isLike !== 'boolean' || !userId) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.MISSING_REQUIRED_FIELDS, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const updatedMovie = await this.movieRepository.likeMovie(movieId, userId, isLike);
            if (!updatedMovie) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.MOVIE_NOT_UPDATED, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
            }
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.LIKE_UPDATED, updatedMovie);
        }
        catch (error) {
            next(error);
        }
    }
    async isMovieLiked(req, res, next) {
        try {
            const { movieId } = req.params;
            const userId = req.decoded?.userId;
            if (!movieId || !userId) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.MISSING_REQUIRED_FIELDS, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const isLiked = await this.movieRepository.hasUserLikedMovie(movieId, userId);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.LIKE_FETCHED, { isLiked });
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
    __param(7, (0, tsyringe_1.inject)('MovieRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], MovieMngController);
