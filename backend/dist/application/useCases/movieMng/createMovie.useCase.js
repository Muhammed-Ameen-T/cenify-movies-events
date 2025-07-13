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
exports.CreateMovieUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const movie_entity_1 = require("../../../domain/entities/movie.entity");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
let CreateMovieUseCase = class CreateMovieUseCase {
    constructor(movieRepository) {
        this.movieRepository = movieRepository;
    }
    async execute(dto) {
        const newMovie = new movie_entity_1.Movie(null, dto.name, dto.genre, dto.trailer, dto.rating, dto.poster, dto.duration, dto.description, dto.language, new Date(dto.releaseDate), 'upcoming', 0, [], dto.is3D, dto.crew, dto.cast, []);
        try {
            const savedMovie = await this.movieRepository.create(newMovie);
            return savedMovie;
        }
        catch (error) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_SAVED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CreateMovieUseCase = CreateMovieUseCase;
exports.CreateMovieUseCase = CreateMovieUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('MovieRepository')),
    __metadata("design:paramtypes", [Object])
], CreateMovieUseCase);
