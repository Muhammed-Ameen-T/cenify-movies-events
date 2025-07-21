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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchMoviesUserDTO = exports.FetchMoviesDTO = exports.SubmitRatingDTO = exports.UpdateMovieDTO = exports.UpdateMovieStatusDTO = exports.CreateMovieDTO = void 0;
const class_validator_1 = require("class-validator");
class CreateMovieDTO {
    constructor(name, genre, trailer, rating, poster, duration, description, language, releaseDate, is3D, crew, cast) {
        this.name = name;
        this.genre = genre;
        this.trailer = trailer;
        this.rating = rating;
        this.poster = poster;
        this.duration = duration;
        this.description = description;
        this.language = language;
        this.releaseDate = releaseDate;
        this.is3D = is3D;
        this.crew = crew;
        this.cast = cast;
    }
}
exports.CreateMovieDTO = CreateMovieDTO;
class UpdateMovieStatusDTO {
    constructor(id, status) {
        this.id = id;
        this.status = status;
    }
}
exports.UpdateMovieStatusDTO = UpdateMovieStatusDTO;
class UpdateMovieDTO {
    constructor(id, name, genre, trailer, rating, poster, duration, description, language, releaseDate, is3D, crew, cast) {
        this.id = id;
        this.name = name;
        this.genre = genre;
        this.trailer = trailer;
        this.rating = rating;
        this.poster = poster;
        this.duration = duration;
        this.description = description;
        this.language = language;
        this.releaseDate = releaseDate;
        this.is3D = is3D;
        this.crew = crew;
        this.cast = cast;
    }
}
exports.UpdateMovieDTO = UpdateMovieDTO;
class SubmitRatingDTO {
    constructor(userId, movieId, theaterId, theaterRating, movieRating, movieReview) {
        this.userId = userId;
        this.movieId = movieId;
        this.theaterId = theaterId;
        this.theaterRating = theaterRating;
        this.movieRating = movieRating;
        this.movieReview = movieReview;
    }
}
exports.SubmitRatingDTO = SubmitRatingDTO;
const class_validator_2 = require("class-validator");
class FetchMoviesDTO {
}
exports.FetchMoviesDTO = FetchMoviesDTO;
__decorate([
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_2.IsNumber)(),
    __metadata("design:type", Number)
], FetchMoviesDTO.prototype, "page", void 0);
__decorate([
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_2.IsNumber)(),
    __metadata("design:type", Number)
], FetchMoviesDTO.prototype, "limit", void 0);
__decorate([
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_2.IsString)(),
    __metadata("design:type", String)
], FetchMoviesDTO.prototype, "search", void 0);
__decorate([
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_2.IsArray)(),
    (0, class_validator_2.IsString)({ each: true }),
    (0, class_validator_2.IsIn)(['upcoming', 'released', 'archived'], { each: true }),
    __metadata("design:type", Array)
], FetchMoviesDTO.prototype, "status", void 0);
__decorate([
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_2.IsArray)(),
    (0, class_validator_2.IsString)({ each: true }),
    __metadata("design:type", Array)
], FetchMoviesDTO.prototype, "genre", void 0);
__decorate([
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_2.IsString)(),
    __metadata("design:type", String)
], FetchMoviesDTO.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_2.IsIn)(['asc', 'desc']),
    __metadata("design:type", String)
], FetchMoviesDTO.prototype, "sortOrder", void 0);
class FetchMoviesUserDTO {
}
exports.FetchMoviesUserDTO = FetchMoviesUserDTO;
__decorate([
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_2.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FetchMoviesUserDTO.prototype, "page", void 0);
__decorate([
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_2.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FetchMoviesUserDTO.prototype, "limit", void 0);
__decorate([
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_2.IsString)(),
    __metadata("design:type", String)
], FetchMoviesUserDTO.prototype, "search", void 0);
__decorate([
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_2.IsArray)(),
    (0, class_validator_2.IsString)({ each: true }),
    __metadata("design:type", Array)
], FetchMoviesUserDTO.prototype, "status", void 0);
__decorate([
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_2.IsArray)(),
    (0, class_validator_2.IsString)({ each: true }),
    __metadata("design:type", Array)
], FetchMoviesUserDTO.prototype, "genre", void 0);
__decorate([
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_2.IsString)(),
    __metadata("design:type", String)
], FetchMoviesUserDTO.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_2.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], FetchMoviesUserDTO.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_2.IsNumber)(),
    __metadata("design:type", Number)
], FetchMoviesUserDTO.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_2.IsNumber)(),
    __metadata("design:type", Number)
], FetchMoviesUserDTO.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_2.IsString)(),
    __metadata("design:type", String)
], FetchMoviesUserDTO.prototype, "selectedLocation", void 0);
