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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchShowSelectionUseCase = void 0;
// src/application/useCases/User/fetchShowSelection.usecase.ts
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
let FetchShowSelectionUseCase = class FetchShowSelectionUseCase {
    constructor(showRepository) {
        this.showRepository = showRepository;
    }
    async execute(params) {
        try {
            return await this.showRepository.findShowSelection(params);
        }
        catch (error) {
            console.error('❌ Error in FetchShowSelectionUseCase:', error);
            throw new custom_error_1.CustomError(error instanceof custom_error_1.CustomError ? error.message : 'Failed to fetch show selection', error instanceof custom_error_1.CustomError ? error.statusCode : httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.FetchShowSelectionUseCase = FetchShowSelectionUseCase;
exports.FetchShowSelectionUseCase = FetchShowSelectionUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ShowRepository')),
    __metadata("design:paramtypes", [Object])
], FetchShowSelectionUseCase);
