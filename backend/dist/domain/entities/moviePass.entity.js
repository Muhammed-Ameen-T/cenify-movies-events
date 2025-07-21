"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoviePassHistory = exports.MoviePass = void 0;
class MoviePass {
    constructor(_id, userId, status, history, purchaseDate, expireDate, moneySaved, totalMovies, createdAt, updatedAt) {
        this._id = _id;
        this.userId = userId;
        this.status = status;
        this.history = history;
        this.purchaseDate = purchaseDate;
        this.expireDate = expireDate;
        this.moneySaved = moneySaved;
        this.totalMovies = totalMovies;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.MoviePass = MoviePass;
class MoviePassHistory {
    constructor(title, date, saved) {
        this.title = title;
        this.date = date;
        this.saved = saved;
    }
}
exports.MoviePassHistory = MoviePassHistory;
