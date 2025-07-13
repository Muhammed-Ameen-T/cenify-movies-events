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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const twilio_1 = __importDefault(require("twilio"));
const env_config_1 = require("../../config/env.config");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
let SmsService = class SmsService {
    constructor() {
        const accountSid = env_config_1.env.TWILIO_ACCOUNT_SID;
        const authToken = env_config_1.env.TWILIO_AUTH_TOKEN;
        if (!accountSid || !authToken) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.TWILIO_CONFIG_MISSING, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        this.client = (0, twilio_1.default)(accountSid, authToken);
    }
    async sendSms(phone, message) {
        try {
            const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
            const twilioPhone = env_config_1.env.TWILIO_PHONE;
            if (!twilioPhone) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.TWILIO_PHONE_MISSING, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
            }
            await this.client.messages.create({
                body: message,
                from: twilioPhone,
                to: formattedPhone,
            });
            console.log(`SMS sent to ${formattedPhone}: ${message}`);
        }
        catch (error) {
            console.error('SmsService: Failed to send SMS:', error);
            throw new custom_error_1.CustomError(error.message || commonErrorMsg_constants_1.default.GENERAL.FAILE_SENDING_SMS, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], SmsService);
