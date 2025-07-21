"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Movie = void 0;
class Movie {
    constructor(_id, name, genre, trailer, rating, poster, duration, description, language, releaseDate, status, likes, likedBy, is3D, crew, cast, reviews, createdAt, updatedAt) {
        this._id = _id;
        this.name = name;
        this.genre = genre;
        this.trailer = trailer;
        this.rating = rating;
        this.poster = poster;
        this.duration = duration;
        this.description = description;
        this.language = language;
        this.releaseDate = releaseDate;
        this.status = status;
        this.likes = likes;
        this.likedBy = likedBy;
        this.is3D = is3D;
        this.crew = crew;
        this.cast = cast;
        this.reviews = reviews;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Movie = Movie;
