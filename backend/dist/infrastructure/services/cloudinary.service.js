"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
// src/infrastructure/services/cloudinary.service.ts
const tsyringe_1 = require("tsyringe");
const cloudinary_1 = require("cloudinary");
const custom_error_1 = require("../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const env_config_1 = require("../../config/env.config");
let CloudinaryService = class CloudinaryService {
    constructor() {
        cloudinary_1.v2.config({
            cloud_name: env_config_1.env.CLOUDINARY_CLOUD_NAME,
            api_key: env_config_1.env.CLOUDINARY_API_KEY,
            api_secret: env_config_1.env.CLOUDINARY_API_SECRET,
        });
    }
    async uploadImage(fileBuffer, fileName) {
        return new Promise((resolve, reject) => {
            const stream = cloudinary_1.v2.uploader.upload_stream({
                folder: 'user_profiles',
                public_id: fileName,
                resource_type: 'image',
            }, (error, result) => {
                if (error) {
                    return reject(new custom_error_1.CustomError(error.message || 'Failed to upload image to Cloudinary', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR));
                }
                if (!result || !result.secure_url) {
                    return reject(new custom_error_1.CustomError('Cloudinary upload did not return a valid result', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR));
                }
                resolve(result.secure_url);
            });
            stream.end(fileBuffer);
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], CloudinaryService);
