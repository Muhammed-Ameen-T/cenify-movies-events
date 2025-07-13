"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Screen = void 0;
class Screen {
    constructor(_id, name, theaterId, seatLayoutId, filledTimes, amenities, createdAt = null, updatedAt = null) {
        this._id = _id;
        this.name = name;
        this.theaterId = theaterId;
        this.seatLayoutId = seatLayoutId;
        this.filledTimes = filledTimes;
        this.amenities = amenities;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Screen = Screen;
