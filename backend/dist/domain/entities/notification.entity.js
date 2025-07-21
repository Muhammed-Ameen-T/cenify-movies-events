"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
class Notification {
    constructor(_id, userId, title, type, description, bookingId, createdAt = new Date(), updatedAt = new Date(), isRead = false, isGlobal = false, readedUsers = []) {
        this._id = _id;
        this.userId = userId;
        this.title = title;
        this.type = type;
        this.description = description;
        this.bookingId = bookingId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isRead = isRead;
        this.isGlobal = isGlobal;
        this.readedUsers = readedUsers;
    }
}
exports.Notification = Notification;
