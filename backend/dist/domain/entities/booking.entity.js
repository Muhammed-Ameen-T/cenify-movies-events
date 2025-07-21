"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
class Booking {
    constructor(_id, // Use Types.ObjectId
    showId, // Use Types.ObjectId
    userId, // Use Types.ObjectId
    bookedSeatsId, bookingId, status, payment, qrCode, subTotal, couponDiscount, couponApplied, convenienceFee, donation, moviePassApplied, moviePassDiscount, totalDiscount, totalAmount, offerDiscount, expiresAt, reason, createdAt, updatedAt) {
        this._id = _id;
        this.showId = showId;
        this.userId = userId;
        this.bookedSeatsId = bookedSeatsId;
        this.bookingId = bookingId;
        this.status = status;
        this.payment = payment;
        this.qrCode = qrCode;
        this.subTotal = subTotal;
        this.couponDiscount = couponDiscount;
        this.couponApplied = couponApplied;
        this.convenienceFee = convenienceFee;
        this.donation = donation;
        this.moviePassApplied = moviePassApplied;
        this.moviePassDiscount = moviePassDiscount;
        this.totalDiscount = totalDiscount;
        this.totalAmount = totalAmount;
        this.offerDiscount = offerDiscount;
        this.expiresAt = expiresAt;
        this.reason = reason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Booking = Booking;
