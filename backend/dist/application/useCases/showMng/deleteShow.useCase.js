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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteShowUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
let DeleteShowUseCase = class DeleteShowUseCase {
    constructor(showRepository) {
        this.showRepository = showRepository;
    }
    async execute(id) {
        try {
            const existingShow = await this.showRepository.findById(id);
            if (!existingShow) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            await this.showRepository.delete(id);
        }
        catch (error) {
            console.error('❌ Error deleting show:', error);
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_DELETED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.DeleteShowUseCase = DeleteShowUseCase;
exports.DeleteShowUseCase = DeleteShowUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ShowRepository')),
    __metadata("design:paramtypes", [Object])
], DeleteShowUseCase);
