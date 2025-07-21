"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const user_entity_1 = require("../../domain/entities/user.entity");
const mongoose_1 = __importStar(require("mongoose"));
const custom_error_1 = require("../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const tsyringe_1 = require("tsyringe");
let AuthRepository = class AuthRepository {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async findById(id) {
        try {
            const user = await this.userModel.findById(id).exec();
            if (!user)
                return null;
            return new user_entity_1.User(user._id, user.name, user.email || '', user.phone || null, user.authId, user.password || null, user.profileImage, user.dob, {
                buyDate: user.moviePass?.buyDate || null,
                expiryDate: user.moviePass?.expiryDate || null,
                isPass: user.moviePass?.isPass || null,
            }, user.loyalityPoints, user.isBlocked, user.role, user.createdAt, user.updatedAt);
        }
        catch (error) {
            throw new custom_error_1.CustomError('Failed to find user by ID.', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async findByEmail(email) {
        try {
            const user = await this.userModel.findOne({ email }).exec();
            if (!user)
                return null;
            return new user_entity_1.User(user._id, user.name, user.email || '', user.phone || null, user.authId, user.password || null, user.profileImage, user.dob, {
                buyDate: user.moviePass?.buyDate || null,
                expiryDate: user.moviePass?.expiryDate || null,
                isPass: user.moviePass?.isPass || null,
            }, user.loyalityPoints, user.isBlocked, user.role, user.createdAt, user.updatedAt);
        }
        catch (error) {
            throw new custom_error_1.CustomError('Failed to find user by email.', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async findByAuthId(authId) {
        try {
            const user = await this.userModel.findOne({ authId });
            if (!user)
                return null;
            return new user_entity_1.User(user._id, user.name, user.email || '', user.phone || null, user.authId, user.password || null, user.profileImage, user.dob, {
                buyDate: user.moviePass?.buyDate || null,
                expiryDate: user.moviePass?.expiryDate || null,
                isPass: user.moviePass?.isPass || null,
            }, user.loyalityPoints, user.isBlocked, user.role, user.createdAt, user.updatedAt);
        }
        catch (error) {
            throw new custom_error_1.CustomError('Failed to find user by email.', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async create(user) {
        if (!user) {
            throw new custom_error_1.CustomError('User data is null.', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        try {
            const newUser = await this.userModel.create({
                _id: user._id,
                name: user.name || 'User',
                email: user.email,
                phone: user.phone || null,
                authId: user.authId,
                password: user.password || null,
                profileImage: user.profileImage,
                dob: user.dob,
                moviePass: user.moviePass,
                loyalityPoints: user.loyalityPoints,
                isBlocked: user.isBlocked,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            });
            return new user_entity_1.User(newUser._id, newUser.name, newUser.email || '', newUser.phone || null, newUser.authId, newUser.password || null, newUser.profileImage, newUser.dob, {
                buyDate: user.moviePass?.buyDate || null,
                expiryDate: user.moviePass?.expiryDate || null,
                isPass: user.moviePass?.isPass || null,
            }, newUser.loyalityPoints, newUser.isBlocked, newUser.role, newUser.createdAt, newUser.updatedAt);
        }
        catch (error) {
            if (error instanceof mongoose_1.default.Error && error.message.includes('duplicate key')) {
                throw new custom_error_1.CustomError('Email already exists.', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            throw new custom_error_1.CustomError('Failed to create user.', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async update(user) {
        try {
            const updatedUser = await this.userModel
                .findByIdAndUpdate(user._id, {
                name: user.name,
                email: user.email,
                phone: user.phone,
                authId: user.authId,
                profileImage: user.profileImage,
                dob: user.dob,
                moviePass: user.moviePass,
                loyalityPoints: user.loyalityPoints,
                isBlocked: user.isBlocked,
                role: user.role,
                updatedAt: user.updatedAt,
            }, { new: true })
                .exec();
            if (!updatedUser) {
                throw new custom_error_1.CustomError('User not found.', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            return new user_entity_1.User(updatedUser._id, updatedUser.name, updatedUser.email || '', updatedUser.phone || null, updatedUser.authId, updatedUser.password || null, updatedUser.profileImage, updatedUser.dob, {
                buyDate: user.moviePass?.buyDate || null,
                expiryDate: user.moviePass?.expiryDate || null,
                isPass: user.moviePass?.isPass || null,
            }, updatedUser.loyalityPoints, updatedUser.isBlocked, updatedUser.role, updatedUser.createdAt, updatedUser.updatedAt);
        }
        catch (error) {
            throw new custom_error_1.CustomError('Failed to update user.', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AuthRepository = AuthRepository;
exports.AuthRepository = AuthRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [mongoose_1.Model])
], AuthRepository);
