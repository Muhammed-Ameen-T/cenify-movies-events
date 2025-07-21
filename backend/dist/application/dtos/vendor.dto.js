"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheaterResponseDTO = exports.AuthResponseDTO = exports.UpdateTheaterDetailsDTO = exports.TheaterDetailsDTO = exports.VerifyOtpVendorDTO = exports.SendOtpVendorDTO = exports.LoginVendorDTO = exports.RegisterVendorDTO = void 0;
class RegisterVendorDTO {
    constructor(name, email, phone, password, accountType) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.accountType = accountType;
    }
}
exports.RegisterVendorDTO = RegisterVendorDTO;
class LoginVendorDTO {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}
exports.LoginVendorDTO = LoginVendorDTO;
class SendOtpVendorDTO {
    constructor(email) {
        this.email = email;
    }
}
exports.SendOtpVendorDTO = SendOtpVendorDTO;
class VerifyOtpVendorDTO {
    constructor(name, email, password, phone, otp) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.otp = otp;
    }
}
exports.VerifyOtpVendorDTO = VerifyOtpVendorDTO;
class TheaterDetailsDTO {
    constructor(name, location, facilities, intervalTime, gallery, email, phone, description, vendorId) {
        this.name = name;
        this.location = location;
        this.facilities = facilities;
        this.intervalTime = intervalTime;
        this.gallery = gallery;
        this.email = email;
        this.phone = phone;
        this.description = description;
        this.vendorId = vendorId;
    }
}
exports.TheaterDetailsDTO = TheaterDetailsDTO;
class UpdateTheaterDetailsDTO {
    constructor(_id, location, facilities, intervalTime, gallery, description) {
        this._id = _id;
        this.location = location;
        this.facilities = facilities;
        this.intervalTime = intervalTime;
        this.gallery = gallery;
        this.description = description;
    }
}
exports.UpdateTheaterDetailsDTO = UpdateTheaterDetailsDTO;
class AuthResponseDTO {
    constructor(token, theater) {
        this.token = token;
        this.theater = theater;
    }
}
exports.AuthResponseDTO = AuthResponseDTO;
// src/application/dtos/vendor.dto.ts
class TheaterResponseDTO {
    constructor(id, name, status, location, facilities, intervalTime, gallery, email, phone, rating, ratingCount, description, vendorId, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.location = location;
        this.facilities = facilities;
        this.intervalTime = intervalTime;
        this.gallery = gallery;
        this.email = email;
        this.phone = phone;
        this.rating = rating;
        this.ratingCount = ratingCount;
        this.description = description;
        this.vendorId = vendorId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.TheaterResponseDTO = TheaterResponseDTO;
