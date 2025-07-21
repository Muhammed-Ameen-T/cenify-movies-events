"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepositoryImpl = void 0;
// src/infrastructure/repositories/user.repository.ts
const tsyringe_1 = require("tsyringe");
const user_entity_1 = require("../../domain/entities/user.entity");
const user_model_1 = require("../database/user.model");
const custom_error_1 = require("../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
let UserRepositoryImpl = class UserRepositoryImpl {
    async findByEmail(email) {
        const user = await user_model_1.UserModel.findOne({
            email: { $regex: new RegExp(`^${email}$`, 'i') }, // Case-insensitive lookup
        });
        return user ? this.toEntity(user) : null;
    }
    async findById(id) {
        const user = await user_model_1.UserModel.findById(id);
        return user ? this.toEntity(user) : null;
    }
    async findByAuthId(authId) {
        const user = await user_model_1.UserModel.findOne({ authId });
        return user ? this.toEntity(user) : null;
    }
    async findByPhone(phone) {
        const user = await user_model_1.UserModel.findOne({ phone });
        return user ? this.toEntity(user) : null;
    }
    async create(user) {
        console.log('📝 Creating user:', user);
        user.email = user.email.toLowerCase(); // Ensure email is stored in lowercase
        const newUser = new user_model_1.UserModel(user);
        const savedUser = await newUser.save();
        console.log('✅ User created successfully:', savedUser);
        return this.toEntity(savedUser);
    }
    async update(user) {
        console.log('🔄 Updating user:', user);
        await user_model_1.UserModel.updateOne({ _id: user._id }, user);
        const updatedUser = await user_model_1.UserModel.findById(user._id);
        if (!updatedUser) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
        }
        return this.toEntity(updatedUser);
    }
    async updateMoviePass(userId, moviePass) {
        console.log('🔄 Updating movie pass for user:', userId);
        const updateResult = await user_model_1.UserModel.updateOne({ _id: userId }, { $set: { moviePass } });
        if (updateResult.modifiedCount === 0) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
        }
        const updatedUser = await user_model_1.UserModel.findById(userId);
        return this.toEntity(updatedUser);
    }
    async updatePassword(email, password) {
        console.log('🔄 Updating password for email:', email);
        await user_model_1.UserModel.updateOne({ email }, { password });
        const updatedUser = await user_model_1.UserModel.findOne({ email });
        if (!updatedUser) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
        }
        return this.toEntity(updatedUser);
    }
    async findUsers(params) {
        try {
            const { page, limit, isBlocked, role, search, sortBy, sortOrder } = params;
            const query = {};
            if (isBlocked !== undefined) {
                query.isBlocked = isBlocked;
            }
            query.role = { $ne: 'admin' };
            if (role && role.length > 0) {
                query.role = { $in: role };
            }
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ];
            }
            const sort = {};
            if (sortBy) {
                sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
            }
            else {
                sort.createdAt = -1;
            }
            const totalCount = await user_model_1.UserModel.countDocuments(query);
            const totalPages = Math.ceil(totalCount / limit);
            const users = await user_model_1.UserModel.find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
            return {
                users: users.map((user) => this.toEntity(user)),
                totalCount,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            };
        }
        catch (error) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.FAILED_FETCHING_USERS, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async updateBlockStatus(id, isBlocked) {
        try {
            console.log('🚫 Updating block status for ID:', id);
            const user = await user_model_1.UserModel.findByIdAndUpdate(id, { isBlocked, updatedAt: new Date() }, { new: true });
            if (!user) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
            }
            console.log('✅ Block status updated:', user);
        }
        catch (error) {
            throw error instanceof custom_error_1.CustomError
                ? error
                : new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.FAILED_UPDATING_BLOCK_STATUS, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async updatePasswordById(userId, password) {
        console.log('🔄 Updating password for userId:', userId);
        await user_model_1.UserModel.updateOne({ _id: userId }, { password, updatedAt: new Date() });
        const updatedUser = await user_model_1.UserModel.findById(userId);
        if (!updatedUser) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
        }
        return this.toEntity(updatedUser);
    }
    async incrementLoyalityPoints(userId, seatCount) {
        try {
            const pointsToAdd = seatCount * 5;
            const updatedUser = await user_model_1.UserModel.findByIdAndUpdate(userId, { $inc: { loyalityPoints: pointsToAdd } }, { new: true });
            if (!updatedUser) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
            }
            return this.toEntity(updatedUser);
        }
        catch (error) {
            console.error('❌ Error incrementing loyalty points:', error);
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_UPDATED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    toEntity(doc) {
        if (!doc) {
            throw new Error('❌ Invalid user document: Cannot convert null to entity');
        }
        return new user_entity_1.User(doc._id ? doc._id.toString() : '', doc.name, doc.email, doc.phone, doc.authId, doc.password, doc.profileImage, doc.dob, doc.moviePass, doc.loyalityPoints, doc.isBlocked, doc.role, doc.createdAt, doc.updatedAt);
    }
};
exports.UserRepositoryImpl = UserRepositoryImpl;
exports.UserRepositoryImpl = UserRepositoryImpl = __decorate([
    (0, tsyringe_1.injectable)()
], UserRepositoryImpl);
