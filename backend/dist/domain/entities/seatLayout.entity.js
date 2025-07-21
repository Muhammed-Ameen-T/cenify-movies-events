"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatLayout = exports.Seat = void 0;
class Seat {
    constructor(_id, uuid, seatLayoutId, number, type, price, position) {
        this._id = _id;
        this.uuid = uuid;
        this.seatLayoutId = seatLayoutId;
        this.number = number;
        this.type = type;
        this.price = price;
        this.position = position;
    }
}
exports.Seat = Seat;
class SeatLayout {
    constructor(_id, uuid, vendorId, layoutName, seatPrice, capacity, seatIds, rowCount, columnCount, createdAt = new Date(), updatedAt = new Date()) {
        this._id = _id;
        this.uuid = uuid;
        this.vendorId = vendorId;
        this.layoutName = layoutName;
        this.seatPrice = seatPrice;
        this.capacity = capacity;
        this.seatIds = seatIds;
        this.rowCount = rowCount;
        this.columnCount = columnCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.SeatLayout = SeatLayout;
