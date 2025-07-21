"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBookingDTO = void 0;
class CreateBookingDTO {
    constructor(showId, userId, bookedSeatsId, payment, subTotal, convenienceFee, donation, totalAmount, couponDiscount, couponApplied, moviePassDiscount, moviePassApplied, expiresAt) {
        this.showId = showId;
        this.userId = userId;
        this.bookedSeatsId = bookedSeatsId;
        this.payment = payment;
        this.subTotal = subTotal;
        this.convenienceFee = convenienceFee;
        this.donation = donation;
        this.totalAmount = totalAmount;
        this.couponDiscount = couponDiscount;
        this.couponApplied = couponApplied;
        this.moviePassDiscount = moviePassDiscount;
        this.moviePassApplied = moviePassApplied;
        this.expiresAt = expiresAt;
    }
}
exports.CreateBookingDTO = CreateBookingDTO;
