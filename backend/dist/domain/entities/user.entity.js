"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(_id, name, email, phone, authId, password, profileImage, dob, moviePass, loyalityPoints, isBlocked, role, createdAt, updatedAt) {
        this._id = _id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.authId = authId;
        this.password = password;
        this.profileImage = profileImage;
        this.dob = dob;
        this.moviePass = moviePass;
        this.loyalityPoints = loyalityPoints;
        this.isBlocked = isBlocked;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.User = User;
