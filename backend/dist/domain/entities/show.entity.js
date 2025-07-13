"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Show = void 0;
class Show {
    constructor(_id, startTime, movieId, theaterId, screenId, vendorId, status, bookedSeats = [], endTime, showDate) {
        this._id = _id;
        this.startTime = startTime;
        this.movieId = movieId;
        this.theaterId = theaterId;
        this.screenId = screenId;
        this.vendorId = vendorId;
        this.status = status;
        this.bookedSeats = bookedSeats;
        this.endTime = endTime;
        this.showDate = showDate;
    }
}
exports.Show = Show;
