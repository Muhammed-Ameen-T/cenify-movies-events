"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordRequestDTO = exports.UserProfileResponseDTO = exports.UpdateProfileRequestDTO = exports.UserResponseDTO = void 0;
// src/application/dtos/user.dto.ts
class UserResponseDTO {
    constructor(id, name, email, phone, role, isBlocked, createdAt, updatedAt, profileImage) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.isBlocked = isBlocked;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.profileImage = profileImage;
    }
}
exports.UserResponseDTO = UserResponseDTO;
class UpdateProfileRequestDTO {
    constructor(name, phone, profileImage, dob) {
        this.name = name;
        this.phone = phone;
        this.profileImage = profileImage;
        this.dob = dob;
    }
}
exports.UpdateProfileRequestDTO = UpdateProfileRequestDTO;
class UserProfileResponseDTO {
    constructor(id, name, email, phone, role, isBlocked, createdAt, updatedAt, profileImage, loyalityPoints) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.isBlocked = isBlocked;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.profileImage = profileImage;
        this.loyalityPoints = loyalityPoints;
    }
}
exports.UserProfileResponseDTO = UserProfileResponseDTO;
class ChangePasswordRequestDTO {
    constructor(userId, oldPassword, newPassword) {
        this.userId = userId;
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
        if (!oldPassword || !newPassword) {
            throw new Error('oldPassword and newPassword are required');
        }
        if (newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters long');
        }
    }
}
exports.ChangePasswordRequestDTO = ChangePasswordRequestDTO;
