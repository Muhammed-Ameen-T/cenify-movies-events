"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyOtpPhoneRequestDTO = exports.SendOtpPhoneRequestDTO = void 0;
class SendOtpPhoneRequestDTO {
    constructor(phone, userId) {
        this.phone = phone;
        this.userId = userId;
    }
}
exports.SendOtpPhoneRequestDTO = SendOtpPhoneRequestDTO;
class VerifyOtpPhoneRequestDTO {
    constructor(phone, otp, userId) {
        this.phone = phone;
        this.otp = otp;
        this.userId = userId;
    }
}
exports.VerifyOtpPhoneRequestDTO = VerifyOtpPhoneRequestDTO;
