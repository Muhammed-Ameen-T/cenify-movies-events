"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Theater = void 0;
class Theater {
    constructor(_id, screens, name, status, location, facilities, createdAt, updatedAt, intervalTime, gallery, email, phone, description, vendorId, rating, ratingCount) {
        this._id = _id;
        this.screens = screens;
        this.name = name;
        this.status = status;
        this.location = location;
        this.facilities = facilities;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.intervalTime = intervalTime;
        this.gallery = gallery;
        this.email = email;
        this.phone = phone;
        this.description = description;
        this.vendorId = vendorId;
        this.rating = rating;
        this.ratingCount = ratingCount;
    }
    isValidEmail() {
        return this.email ? /\S+@\S+\.\S+/.test(this.email) : false;
    }
}
exports.Theater = Theater;
